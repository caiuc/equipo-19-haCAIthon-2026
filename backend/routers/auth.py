from fastapi import APIRouter, HTTPException

from schemas.auth import LoginRequest, RegisterRequest
from services.auth_service import login_user, register_user


router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/login")
def login(data: LoginRequest):

    try:
        response = login_user(
            data.email,
            data.password
        )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "user": {
                "id": response.user.id,
                "email": response.user.email
            }
        }

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos"
        )

@router.post("/register")
def register(data: RegisterRequest):

    if data.role not in ["teacher", "student"]:
        raise HTTPException(
            status_code=400,
            detail="Role debe ser teacher o student"
        )

    try:
        response = register_user(
            data.email,
            data.password,
            data.name,
            data.role,
            True
        )

        return {
            "message": "Usuario creado",
            "user_id": response.user.id
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )
