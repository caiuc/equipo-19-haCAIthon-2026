from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import get_current_user
from schemas.room import RoomCreate
from services.room_service import (
    create_room
)

from database import supabase

router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


@router.get("/")
def rooms(current_user = Depends(get_current_user)):

    response = (supabase.table("rooms").select("*").execute())
    
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
