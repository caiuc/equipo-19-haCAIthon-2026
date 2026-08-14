import logging

from database import supabase
from database_secret import admin_supabase

logger = logging.getLogger(__name__)


def login_user(email: str, password: str):
    return supabase.auth.sign_in_with_password({
        "email": email,
        "password": password
    })


def register_user(
    email: str,
    password: str,
    name: str,
    role: str,
    email_confirm: bool = True,
):
    """Crea el usuario en auth.users y su fila en profiles.

    Se usa el Admin API en vez de sign_up() porque sign_up() choca contra el
    limite de emails por hora de Supabase al crear usuarios de prueba.
    """
    response = admin_supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": email_confirm
    })

    user = response.user

    if user is None:
        return None

    try:
        admin_supabase.table("profiles").insert({
            "id": user.id,
            "name": name,
            "role": role
        }).execute()

    except Exception:
        # Sin esta reversion quedaria un usuario en auth.users sin fila en
        # profiles: podria loguearse, pero ninguna ruta sabria que rol tiene
        # y quedaria en un limbo imposible de depurar.
        logger.exception(
            "Fallo el insert en profiles, revirtiendo el usuario %s", user.id
        )
        admin_supabase.auth.admin.delete_user(user.id)
        raise

    return response
