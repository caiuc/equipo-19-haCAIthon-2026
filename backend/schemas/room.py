from pydantic import BaseModel


class RoomCreate(BaseModel):
    code: str
    name: str
    status: str = "active"


class RoomJoin(BaseModel):
    code: str
