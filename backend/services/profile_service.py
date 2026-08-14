from database_secret import admin_supabase


def get_profile(user_id: str) -> dict | None:
    """Devuelve el perfil de la aplicacion (nombre y rol) o None si no existe.

    Se usa el cliente admin porque `profiles` tiene RLS activo y el backend
    valida los permisos por su cuenta a partir del JWT.
    """
    response = (
        admin_supabase
        .table("profiles")
        .select("id, name, role")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]
