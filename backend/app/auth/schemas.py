from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    RECEPCIONISTA = "RECEPCIONISTA"
    ENTRENADOR = "ENTRENADOR"


class ModulePermission(BaseModel):
    create: bool = False
    read: bool = False
    update: bool = False
    delete: bool = False


class RolePermissions(BaseModel):
    clients: ModulePermission = ModulePermission()
    employees: ModulePermission = ModulePermission()
    products: ModulePermission = ModulePermission()
    sales: ModulePermission = ModulePermission()
    reports: ModulePermission = ModulePermission()
    config: ModulePermission = ModulePermission()


class StatusEnum(str, Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[RoleEnum] = None


class UserResponse(BaseModel):
    username: str
    role: RoleEnum
    employee_id: Optional[str] = None


class LoginResponse(BaseModel):
    user: UserResponse
    token: TokenResponse


class EmployeeBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    document_number: str = Field(..., min_length=5, max_length=20)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    role: RoleEnum = RoleEnum.RECEPCIONISTA
    status: StatusEnum = StatusEnum.ACTIVO


class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=6)


class EmployeeUpdate(BaseModel):
    document_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    role: Optional[RoleEnum] = None
    status: Optional[StatusEnum] = None


class EmployeeResponse(EmployeeBase):
    id: str
    permissions: RolePermissions
    created_at: datetime
    updated_at: Optional[datetime] = None


class EmployeeInDB(EmployeeBase):
    id: str
    password_hash: str
    permissions: RolePermissions
    created_at: datetime
    updated_at: Optional[datetime] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
