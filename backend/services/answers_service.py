import unicodedata

from fastapi import HTTPException

from database_secret import admin_supabase


def _normalize_text(value: str) -> str:
    """Ignora mayusculas, tildes y espacios de sobra.

    Un alumno que escribe 'triangulo' sin tilde sabe la respuesta: marcarsela
    mal seria evaluar su teclado y no su matematica. Replica la misma
    normalizacion que hace el cliente en frontend/src/lib/answer.ts.
    """
    lowered = " ".join(value.strip().lower().split())
    decomposed = unicodedata.normalize("NFD", lowered)
    return "".join(c for c in decomposed if not unicodedata.combining(c))


def _as_number(value: str):
    """Acepta coma decimal: en Chile se escribe 3,5 y no 3.5."""
    try:
        return float(value.strip().replace(",", "."))
    except (ValueError, AttributeError):
        return None


def _is_correct(submitted: str, correct: str, exercise_type: str) -> bool:
    if exercise_type == "numeric":
        a = _as_number(submitted)
        b = _as_number(correct)
        return a is not None and b is not None and a == b

    if exercise_type == "text":
        return _normalize_text(submitted) == _normalize_text(correct)

    return submitted == correct


def push_answers_service(answers, user_id: str):
    """Recibe la cola de respuestas que el alumno resolvio sin conexion.

    El cliente manda su correccion local, pero aca se IGNORA y se recalcula
    contra exercise_keys. Ese recalculo es lo que hace defendible que las
    claves viajen al dispositivo: quien manipule IndexedDB solo altera su
    propio feedback inmediato, jamas la nota que ve el profesor.

    Es idempotente: la tabla tiene unique(exercise_id, student_id), asi que
    reenviar algo ya guardado no lo duplica. Por eso un reintento tras un corte
    de red es seguro.
    """
    accepted = []

    # Cache por actividad para no repetir consultas cuando llegan 10 respuestas
    # de la misma tarea, que es el caso normal.
    activity_cache = {}

    for answer in answers:
        exercise_response = (
            admin_supabase
            .table("exercises")
            .select("id, activity_id, points")
            .eq("id", answer.exercise_id)
            .execute()
        )

        if not exercise_response.data:
            continue

        exercise = exercise_response.data[0]
        activity_id = exercise["activity_id"]

        if activity_id not in activity_cache:
            activity_response = (
                admin_supabase
                .table("activities")
                .select("id, room_id, exercise_type")
                .eq("id", activity_id)
                .execute()
            )

            if not activity_response.data:
                activity_cache[activity_id] = None
            else:
                activity = activity_response.data[0]

                membership = (
                    admin_supabase
                    .table("room_members")
                    .select("id")
                    .eq("room_id", activity["room_id"])
                    .eq("user_id", user_id)
                    .execute()
                )

                # Sin membresia la respuesta se descarta en silencio: el cliente
                # no debe poder registrar respuestas en salas ajenas.
                activity_cache[activity_id] = (
                    activity if membership.data else None
                )

        activity = activity_cache[activity_id]

        if activity is None:
            continue

        key_response = (
            admin_supabase
            .table("exercise_keys")
            .select("correct_answer")
            .eq("exercise_id", exercise["id"])
            .execute()
        )

        if not key_response.data:
            continue

        correct_answer = key_response.data[0]["correct_answer"]

        is_correct = _is_correct(
            answer.submitted_answer,
            correct_answer,
            activity["exercise_type"],
        )

        try:
            (
                admin_supabase
                .table("answers")
                .upsert(
                    {
                        "exercise_id": exercise["id"],
                        "student_id": user_id,
                        "submitted_answer": answer.submitted_answer,
                        "is_correct": is_correct,
                        "points_awarded": exercise["points"] if is_correct else 0,
                    },
                    on_conflict="exercise_id,student_id",
                )
                .execute()
            )
        except Exception:
            # Una respuesta que falla no debe tumbar el lote: el cliente la
            # reintenta sola en el proximo evento `online`.
            continue

        # El formato de la clave debe coincidir exacto con el que usa IndexedDB
        # en el cliente. Si no coincide, la respuesta queda pendiente para
        # siempre y se reenvia en loop.
        accepted.append(f"{activity_id}:{exercise['id']}")

    return {"accepted": accepted}
