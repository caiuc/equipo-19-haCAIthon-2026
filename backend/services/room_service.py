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

def get_student_rooms_service(user_id: str):
    memberships_response = (
        admin_supabase
        .table("room_members")
        .select("room_id")
        .eq("user_id", user_id)
        .execute()
    )

    room_ids = [
        membership["room_id"]
        for membership in memberships_response.data
    ]

    if not room_ids:
        return []

    rooms_response = (
        admin_supabase
        .table("rooms")
        .select("*")
        .in_("id", room_ids)
        .execute()
    )

    return rooms_response.data