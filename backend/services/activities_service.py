from fastapi import HTTPException
from database_secret import admin_supabase


def get_activity_package_service(activity_id: str, user_id: str):

    activity_response = (
        admin_supabase
        .table("activities")
        .select("*")
        .eq("id", activity_id)
        .execute()
    )

    if not activity_response.data:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    activity = activity_response.data[0]

    if activity["mode"] == "live":
        raise HTTPException(
            status_code=403,
            detail="Live activities cannot expose correction keys"
        )

    room_response = (
        admin_supabase
        .table("rooms")
        .select("id, name, teacher_id")
        .eq("id", activity["room_id"])
        .execute()
    )

    if not room_response.data:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    room = room_response.data[0]

    is_teacher = room["teacher_id"] == user_id

    membership_response = (
        admin_supabase
        .table("room_members")
        .select("id")
        .eq("room_id", room["id"])
        .eq("user_id", user_id)
        .execute()
    )

    is_member = bool(membership_response.data)

    if not is_teacher and not is_member:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this room"
        )

    exercises_response = (
        admin_supabase
        .table("exercises")
        .select("*")
        .eq("activity_id", activity_id)
        .order("position")
        .execute()
    )

    exercises = []

    for exercise in exercises_response.data:

        key_response = (
            admin_supabase
            .table("exercise_keys")
            .select("correct_answer, explanation")
            .eq("exercise_id", exercise["id"])
            .execute()
        )

        correction = (
            key_response.data[0]
            if key_response.data
            else None
        )

        exercises.append({
            "id": exercise["id"],
            "position": exercise["position"],
            "prompt": exercise["prompt"],
            "options": (
                exercise["options"]
                if activity["exercise_type"] == "multiple_choice"
                else None
            ),
            "points": exercise["points"],
            "correct_answer": (
                correction["correct_answer"]
                if correction
                else None
            ),
            "explanation": (
                correction["explanation"]
                if correction
                else None
            )
        })

    return {
        "activity_id": activity["id"],
        "title": activity["title"],
        "subject": activity["subject"],
        "room_name": room["name"],
        "mode": activity["mode"],
        "exercise_type": activity["exercise_type"],
        "exercises": exercises
    }


def create_activity_service(activity, user_id: str):

    # 1. Buscar room
    room_response = (
        admin_supabase
        .table("rooms")
        .select("id, teacher_id")
        .eq("id", activity.room_id)
        .execute()
    )

    if not room_response.data:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    room = room_response.data[0]

    # 2. Solo el profesor puede crear actividades
    if room["teacher_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the room teacher can create activities"
        )

    # 3. Crear activity
    activity_response = (
        admin_supabase
        .table("activities")
        .insert({
            "room_id": activity.room_id,
            "created_by": user_id,
            "title": activity.title,
            "subject": activity.subject,
            "exercise_type": activity.exercise_type,
            "difficulty": activity.difficulty,
            "mode": activity.mode,
            "status": activity.status,
            "due_at": activity.due_at
        })
        .execute()
    )

    if not activity_response.data:
        raise HTTPException(
            status_code=500,
            detail="Could not create activity"
        )

    new_activity = activity_response.data[0]
    activity_id = new_activity["id"]

    created_exercises = []

    # 4. Crear ejercicios
    for exercise in activity.exercises:

        exercise_response = (
            admin_supabase
            .table("exercises")
            .insert({
                "activity_id": activity_id,
                "position": exercise.position,
                "prompt": exercise.prompt,
                "options": exercise.options,
                "points": exercise.points
            })
            .execute()
        )

        if not exercise_response.data:
            raise HTTPException(
                status_code=500,
                detail="Could not create exercise"
            )

        new_exercise = exercise_response.data[0]
        exercise_id = new_exercise["id"]

        # 5. Crear clave de corrección
        (
            admin_supabase
            .table("exercise_keys")
            .insert({
                "exercise_id": exercise_id,
                "correct_answer": exercise.correct_answer,
                "explanation": exercise.explanation
            })
            .execute()
        )

        created_exercises.append(new_exercise)

    return {
        "message": "Activity created successfully",
        "activity_id": activity_id,
        "exercises_created": len(created_exercises)
    }


def get_activity_results_service(
    activity_id: str,
    user_id: str
):

    # 1. Buscar actividad
    activity_response = (
        admin_supabase
        .table("activities")
        .select("*")
        .eq("id", activity_id)
        .execute()
    )

    if not activity_response.data:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    activity = activity_response.data[0]

    # 2. Buscar sala
    room_response = (
        admin_supabase
        .table("rooms")
        .select("id, name, teacher_id")
        .eq("id", activity["room_id"])
        .execute()
    )

    if not room_response.data:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    room = room_response.data[0]

    # 3. Solo el profesor puede ver resultados
    if room["teacher_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the room teacher can view results"
        )

    # 4. Obtener ejercicios
    exercises_response = (
        admin_supabase
        .table("exercises")
        .select("id, position, prompt, points")
        .eq("activity_id", activity_id)
        .order("position")
        .execute()
    )

    exercises = exercises_response.data

    if not exercises:
        return {
            "activity_id": activity["id"],
            "title": activity["title"],
            "room_name": room["name"],
            "results": []
        }

    exercise_ids = [
        exercise["id"]
        for exercise in exercises
    ]

    # 5. Obtener todas las respuestas
    answers_response = (
        admin_supabase
        .table("answers")
        .select("*")
        .in_("exercise_id", exercise_ids)
        .execute()
    )

    answers = answers_response.data

    # 6. Agrupar por estudiante
    students = {}

    for answer in answers:
        student_id = answer["student_id"]

        if student_id not in students:
            students[student_id] = {
                "student_id": student_id,
                "total_points": 0,
                "answers": []
            }

        students[student_id]["total_points"] += (
            answer["points_awarded"] or 0
        )

        students[student_id]["answers"].append({
            "exercise_id": answer["exercise_id"],
            "submitted_answer": answer["submitted_answer"],
            "is_correct": answer["is_correct"],
            "points_awarded": answer["points_awarded"],
            "answered_at": answer["answered_at"]
        })

    return {
        "activity_id": activity["id"],
        "title": activity["title"],
        "room_name": room["name"],
        "results": list(students.values())
    }

def list_room_activities_service(room_id: str, user_id: str):
    """Actividades activas de una sala, sin las claves de correccion.

    Es el eslabon que faltaba entre GET /rooms/student y
    GET /activities/{id}/package: el alumno necesita saber QUE actividades hay
    antes de poder descargar una.

    Devuelve solo metadatos. Las claves viajan unicamente en /package, y solo
    para los modos descargables.
    """
    is_teacher = (
        admin_supabase
        .table("rooms")
        .select("id")
        .eq("id", room_id)
        .eq("teacher_id", user_id)
        .execute()
    )

    is_member = (
        admin_supabase
        .table("room_members")
        .select("id")
        .eq("room_id", room_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not is_teacher.data and not is_member.data:
        raise HTTPException(
            status_code=403,
            detail="No perteneces a esta sala"
        )

    activities_response = (
        admin_supabase
        .table("activities")
        .select("id, title, subject, exercise_type, difficulty, mode, status, due_at")
        .eq("room_id", room_id)
        .eq("status", "active")
        .order("created_at", desc=True)
        .execute()
    )

    activities = []

    for activity in activities_response.data:
        count_response = (
            admin_supabase
            .table("exercises")
            .select("id")
            .eq("activity_id", activity["id"])
            .execute()
        )

        activities.append({
            "activity_id": activity["id"],
            "title": activity["title"],
            "subject": activity["subject"],
            "exercise_type": activity["exercise_type"],
            "difficulty": activity["difficulty"],
            "mode": activity["mode"],
            "exercise_count": len(count_response.data),
        })

    return activities
