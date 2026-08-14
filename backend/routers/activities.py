from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import get_current_user
from database import admin_supabase

router = APIRouter(
    prefix="/activities",
    tags=["activities"]
)

@router.get("/{activity_id}/package")
def get_activity_package(
    activity_id: str,
    current_user=Depends(get_current_user)
):
    # Buscar actividad
    activity_response = (
        admin_supabase
        .table("activities")
        .select("*")
        .eq("id", activity_id)
        .execute()
    )

    if not activity_response.data:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    activity = activity_response.data[0]
    
    # Buscar preguntas de la actividad
    questions_response = (
        admin_supabase
        .table("questions")
        .select("*")
        .eq("activity_id", activity_id)
        .execute()
    )

    return {
        "activity": activity,
        "questions": questions_response.data
    }