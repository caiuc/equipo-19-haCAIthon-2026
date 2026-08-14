from pydantic import BaseModel
from datetime import datetime


class RoomCreate(BaseModel):
    code: str
    name: str
    status: str = "active"


class RoomJoin(BaseModel):
    code: str


class RoomResponse(BaseModel):
    id: str
    code: str
    name: str
    teacher_id: str
    status: str
    created_at: datetime = None

class JoinRoomRequest(BaseModel):
    code: str
    display_name: str