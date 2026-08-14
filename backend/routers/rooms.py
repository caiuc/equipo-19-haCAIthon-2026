from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import get_current_user
from schemas.room import RoomCreate
from services.room_service import (
    create_room,
    get_student_rooms_service,
)

from database import supabase
from database_secret import admin_supabase

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


@router.get("/")
def rooms_teacher(current_user = Depends(get_current_user)):

    print("USUARIO ACTUAL:", current_user.id)

    response = (
        admin_supabase
        .table("rooms")
        .select("*")
        .eq("teacher_id", current_user.id)
        .execute()
    )

    print("SALAS ENCONTRADAS:", response.data)

    return response.data


@router.post("/")
def new_room(
    room: RoomCreate,
    current_user=Depends(get_current_user)
):
    try:
        teacher_id = current_user.id

        return create_room(
            room.code,
            room.name,
            teacher_id,
            room.status
        )

    except Exception as e:
        print("ERROR AL CREAR ROOM:", repr(e))
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.get("/student")
def get_student_rooms(
    current_user=Depends(get_current_user)
):
    return get_student_rooms_service(
        current_user.id
    )

from schemas.room import RoomResponse
from typing import List


@router.get(
    "/student",
    response_model=List[RoomResponse]
)
def get_student_rooms(
    current_user=Depends(get_current_user)
):
    return get_student_rooms_service(
        current_user.id
    )