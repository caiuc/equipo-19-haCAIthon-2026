from pydantic import BaseModel
from typing import Optional, List


class ExercisePackage(BaseModel):
    id: str
    position: int
    prompt: str
    options: Optional[List[str]]
    points: int
    correct_answer: str
    explanation: Optional[str]


class ActivityPackage(BaseModel):
    activity_id: str
    title: str
    subject: Optional[str]
    room_name: str
    mode: str
    exercises: List[ExercisePackage]

class ExerciseCreate(BaseModel):
    position: int
    prompt: str
    options: Optional[List[str]] = None
    points: int
    correct_answer: str
    explanation: Optional[str] = None


class ActivityCreate(BaseModel):
    room_id: str
    title: str
    subject: str
    exercise_type: str
    difficulty: str
    mode: str
    status: str = "active"
    due_at: Optional[str] = None
    exercises: List[ExerciseCreate]

class AnswerResult(BaseModel):
    exercise_id: str
    submitted_answer: str
    is_correct: bool
    points_awarded: Optional[float] = 0
    answered_at: Optional[str] = None


class StudentActivityResult(BaseModel):
    student_id: str
    total_points: float
    answers: List[AnswerResult]


class ActivityResultsResponse(BaseModel):
    activity_id: str
    title: str
    room_name: str
    results: List[StudentActivityResult]