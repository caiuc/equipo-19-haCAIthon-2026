from fastapi import APIRouter, Depends

from dependencies.auth import get_current_user
from schemas.answer import BulkAnswersRequest, BulkAnswersResponse
from services.answers_service import push_answers_service

router = APIRouter(
    prefix="/answers",
    tags=["Answers"]
)


@router.post("/bulk", response_model=BulkAnswersResponse)
def push_answers(
    payload: BulkAnswersRequest,
    current_user=Depends(get_current_user)
):
    """Recibe la cola de respuestas resueltas sin conexion.

    El servidor recalcula si cada respuesta es correcta e ignora la correccion
    que trae el cliente.
    """
    return push_answers_service(
        payload.answers,
        current_user.id
    )
