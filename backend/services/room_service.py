from database import supabase
from database_secret import admin_supabase


def create_room(code, name, teacher_id, status):
    response = (
        admin_supabase
        .table("rooms")
        .insert({
            "code": code,
            "name": name,
            "teacher_id": teacher_id,
            "status": status
        })
        .execute()
    )

    return response.data
