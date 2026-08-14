import logging

from database_secret import admin_supabase
from services.room_code import generate_room_code

logger = logging.getLogger(__name__)

MAX_CODE_ATTEMPTS = 5


def create_room(name: str, teacher_id: str, status: str = "active") -> dict:
    """Crea una sala generando el codigo en el servidor.

    El codigo NO puede venir del cliente: si viniera, cualquiera podria elegirlo,
    ocupar codigos a proposito o colisionar con salas existentes.

    No se consulta antes si el codigo esta libre porque entre el SELECT y el
    INSERT hay una condicion de carrera. La restriccion `unique(code)` de la
    tabla es la garantia real: si colisiona, el insert falla y se reintenta.
    """
    for attempt in range(MAX_CODE_ATTEMPTS):
        code = generate_room_code()

        try:
            response = (
                admin_supabase
                .table("rooms")
                .insert({
                    "code": code,
                    "name": name,
                    "teacher_id": teacher_id,
                    "status": status,
                })
                .execute()
            )

            return response.data[0]

        except Exception as error:
            logger.warning(
                "Insert de sala fallo (intento %s/%s): %s",
                attempt + 1,
                MAX_CODE_ATTEMPTS,
                type(error).__name__,
            )

            if attempt == MAX_CODE_ATTEMPTS - 1:
                raise

    raise RuntimeError("No se pudo crear la sala")


def get_rooms_for_teacher(teacher_id: str) -> list[dict]:
    """Salas creadas por el profesor autenticado."""
    response = (
        admin_supabase
        .table("rooms")
        .select("*")
        .eq("teacher_id", teacher_id)
        .order("created_at", desc=True)
        .execute()
    )

    return response.data


def get_rooms_for_student(student_id: str) -> list[dict]:
    """Salas a las que el alumno se unio, via room_members."""
    response = (
        admin_supabase
        .table("room_members")
        .select("rooms(*)")
        .eq("user_id", student_id)
        .execute()
    )

    return [row["rooms"] for row in response.data if row.get("rooms")]
