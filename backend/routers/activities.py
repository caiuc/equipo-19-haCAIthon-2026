from fastapi import APIRouter, Depends
from dependencies.auth import get_current_user
from schemas.activities import ActivityPackage
from services.activities_service import get_activity_package_service
from schemas.activities import ActivityCreate
from services.activities_service import create_activity_service
from schemas.activities import ActivityResultsResponse
from services.activities_service import get_activity_results_service
from services.activities_service import list_room_activities_service

router = APIRouter(
    prefix="/activities",
    tags=["activities"]
)


@router.get(
    "/{activity_id}/package",
    response_model=ActivityPackage
)
def get_activity_package(
    activity_id: str,
    current_user=Depends(get_current_user)
):
    return get_activity_package_service(
        activity_id,
        current_user.id
    )

@router.get("/")
def list_room_activities(
    room_id: str,
    current_user=Depends(get_current_user)
):
    """Actividades de una sala, sin claves de correccion.

    Sin esto el alumno no tiene forma de saber que actividades existen: solo
    podia pedir /package si ya conocia el id de memoria.
    """
    return list_room_activities_service(
        room_id,
        current_user.id
    )


@router.post("/")
def create_activity(
    activity: ActivityCreate,
    current_user=Depends(get_current_user)
):
    return create_activity_service(
        activity,
        current_user.id
    )

@router.get(
    "/{activity_id}/results",
    response_model=ActivityResultsResponse
)
def get_activity_results(
    activity_id: str,
    current_user=Depends(get_current_user)
):
    return get_activity_results_service(
        activity_id,
        current_user.id
    )