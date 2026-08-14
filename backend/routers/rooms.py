import logging

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies.auth import get_current_user, require_teacher
from schemas.room import RoomCreate
from services.profile_service import get_profile
from services.room_service import (
    create_room,
    get_rooms_for_student,
    get_rooms_for_teacher,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


@router.get("/")
def list_my_rooms(current_user=Depends(get_current_user)):
    """Devuelve solo las salas del usuario autenticado.

    Antes hacia `select("*")` sin filtro y con el cliente anon: RLS lo dejaba
    siempre en []. Cambiarlo al cliente admin sin filtrar habria expuesto las
    salas de todos los profesores, con sus codigos, a cualquier alumno.
    """
    profile = get_profile(current_user.id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene un perfil asociado"
        )

    if profile.get("role") == "teacher":
        return get_rooms_for_teacher(current_user.id)

    return get_rooms_for_student(current_user.id)


@router.post("/", status_code=status.HTTP_201_CREATED)
def new_room(
    room: RoomCreate,
    current_user=Depends(require_teacher)
):
    try:
        return create_room(
            name=room.name,
            teacher_id=current_user.id
        )

    except Exception:
        # No se devuelve str(e): el error crudo de Postgres expone nombres de
        # tablas y restricciones al cliente. El detalle queda en el log.
        logger.exception("Error al crear la sala")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo crear la sala"
        )
