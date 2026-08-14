import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import AuthApiError

from database import supabase
from services.profile_service import get_profile

logger = logging.getLogger(__name__)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    # La llamada va dentro del try, pero los `raise` propios quedan afuera:
    # antes un `except Exception` envolvente se tragaba el HTTPException que
    # se lanzaba unas lineas mas arriba.
    try:
        response = supabase.auth.get_user(token)

    except AuthApiError as error:
        # Supabase respondio y rechazo el token: la sesion no sirve.
        logger.info("Token rechazado por Supabase: %s", error)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado"
        ) from error

    except Exception as error:
        # No hubo respuesta de Supabase (sin red, DNS, timeout). Devolver 401
        # aca seria mentir: el token puede estar perfecto. El frontend necesita
        # distinguir "tu sesion vencio" de "no hay conexion" para poder entrar
        # en modo offline en vez de mandar al usuario a la pantalla de login.
        logger.exception("No se pudo contactar a Supabase para validar el token")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No se pudo validar la sesion. Reintenta cuando haya conexion."
        ) from error

    if response is None or response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalido o expirado"
        )

    return response.user


def require_teacher(current_user=Depends(get_current_user)):
    """Exige que el usuario autenticado tenga rol `teacher`.

    Sin esto cualquier alumno podia crear salas: el JWT solo prueba quien sos,
    no que puedas hacer.
    """
    profile = get_profile(current_user.id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario no tiene un perfil asociado"
        )

    if profile.get("role") != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los profesores pueden realizar esta accion"
        )

    return current_user
