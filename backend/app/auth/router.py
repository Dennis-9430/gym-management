from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.config import settings
from app.auth.schemas import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    TokenResponse,
)
from app.auth.utils import create_access_token, get_current_active_user, TokenData
from app.auth import service as auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    user = await auth_service.authenticate_user(
        db, login_data.username, login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires,
    )

    return LoginResponse(
        user=UserResponse(
            username=user.username,
            role=user.role,
            employee_id=user.id,
        ),
        token=TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
        ),
    )


@router.post("/logout")
async def logout(current_user: TokenData = Depends(get_current_active_user)):
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: TokenData = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    employee = await auth_service.get_employee_by_username(db, current_user.username)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        username=employee.username,
        role=employee.role,
        employee_id=employee.id,
    )
