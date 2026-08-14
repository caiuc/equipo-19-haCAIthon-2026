"""Script manual para borrar un usuario de prueba.

Uso:
    python delete_user.py <UUID_DEL_USUARIO>

CUIDADO: las tablas tienen `on delete cascade`. Borrar un profesor se lleva
puestas sus salas, sus actividades y todo lo que cuelgue de ellas.

Este archivo reemplaza al antiguo `test.py`, que ejecutaba el borrado con un
UUID fijo con solo importarlo: bastaba con abrirlo o correrlo por curiosidad
para perder un usuario.
"""

import sys

from database_secret import admin_supabase


def delete_user(user_id: str) -> None:
    admin_supabase.auth.admin.delete_user(user_id)
    print(f"Usuario {user_id} eliminado")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(1)

    delete_user(sys.argv[1])
