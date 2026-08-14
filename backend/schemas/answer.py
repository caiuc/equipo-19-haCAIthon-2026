from typing import List, Optional

from pydantic import BaseModel


class AnswerSubmission(BaseModel):
    # `activity_id` llega solo para armar la clave que espera el cliente. La
    # tabla `answers` no tiene esa columna: se deriva por exercises.activity_id.
    activity_id: Optional[str] = None
    exercise_id: str
    submitted_answer: str
    answered_at: Optional[str] = None


class BulkAnswersRequest(BaseModel):
    answers: List[AnswerSubmission]


class BulkAnswersResponse(BaseModel):
    # Claves "{activity_id}:{exercise_id}" de las respuestas que se guardaron.
    accepted: List[str]
