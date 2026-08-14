import logging

from fastapi import APIRouter, HTTPException, status

from schemas.auth import LoginRequest, RegisterRequest
from services.auth_service import login_user, register_user

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

VALID_ROLES = ("teacher", "student")


@router.post("/login")
def login(data: LoginRequest):

    try:
        response = login_user(
            data.email,
            data.password
        )

    except Exception as error:
        logger.info("Login fallido para %s: %s", data.email, type(error).__name__)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        ) from error

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token,
        "user": {
            "id": response.user.id,
            "email": response.user.email
        }
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest):

    if data.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role debe ser teacher o student"
        )

    try:
        response = register_user(
            data.email,
            data.password,
            data.name,
            data.role
        )

    except Exception as error:
        # El mensaje crudo de Supabase puede revelar si un email ya existe,
        # lo que permite enumerar usuarios. El detalle queda en el log.
        logger.exception("Error al registrar %s", data.email)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el usuario"
        ) from error

    if response is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo crear el usuario"
        )

    return {
        "message": "Usuario creado",
        "user_id": response.user.id
    }
