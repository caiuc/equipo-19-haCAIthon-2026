from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    # Ni `code` ni `teacher_id` ni `status` vienen del cliente: el codigo lo
    # genera el servidor, el profesor sale del JWT y el estado es interno.
    name: str = Field(min_length=3, max_length=60)


class RoomJoin(BaseModel):
    code: str = Field(min_length=6, max_length=6)
