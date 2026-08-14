from database import supabase
from database_secret import admin_supabase
from fastapi import HTTPException



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


from fastapi import HTTPException


def join_room_service(
    code: str,
    user_id: str,
    display_name: str
):

    room_response = (
        admin_supabase
        .table("rooms")
        .select("id, name, code, status")
        .eq("code", code)
        .execute()
    )

    if not room_response.data:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    room = room_response.data[0]

    if room["status"] != "active":
        raise HTTPException(
            status_code=403,
            detail="Room is not active"
        )

    membership_response = (
        admin_supabase
        .table("room_members")
        .select("room_id")
        .eq("room_id", room["id"])
        .eq("user_id", user_id)
        .execute()
    )

    if membership_response.data:
        raise HTTPException(
            status_code=409,
            detail="User is already a member of this room"
        )

    admin_supabase.table("room_members").insert({
        "room_id": room["id"],
        "user_id": user_id,
        "display_name": display_name
    }).execute()

    return {
        "message": "Joined room successfully",
        "room": {
            "id": room["id"],
            "code": room["code"],
            "name": room["name"]
        }
    }

def get_room_students_service(room_id: str, user_id: str):
    """Alumnos inscritos en una sala. Solo para el profesor de esa sala."""
    room_response = (
        admin_supabase
        .table("rooms")
        .select("id, teacher_id")
        .eq("id", room_id)
        .execute()
    )

    if not room_response.data:
        raise HTTPException(status_code=404, detail="Room not found")

    if room_response.data[0]["teacher_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Only the room teacher can view the roster"
        )

    members_response = (
        admin_supabase
        .table("room_members")
        .select("user_id, joined_at")
        .eq("room_id", room_id)
        .execute()
    )

    students = []

    for member in members_response.data:
        profile_response = (
            admin_supabase
            .table("profiles")
            .select("name")
            .eq("id", member["user_id"])
            .execute()
        )

        students.append({
            "student_id": member["user_id"],
            "name": (
                profile_response.data[0]["name"]
                if profile_response.data
                else "Sin nombre"
            ),
            "joined_at": member["joined_at"],
        })

    return students
