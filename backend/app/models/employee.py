from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.auth.schemas import RolePermissions


class StatusEnum(str, Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"


class EmployeeBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    document_number: str = Field(..., min_length=5, max_length=20)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    role: str = Field(...)
    status: StatusEnum = StatusEnum.ACTIVO


class EmployeeCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    document_number: str = Field(..., min_length=5, max_length=20)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    phone: str = Field(..., min_length=7, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    role: str = Field(...)
    password: str = Field(..., min_length=6)


class EmployeeUpdate(BaseModel):
    document_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: str
    username: str
    document_number: str
    first_name: str
    last_name: str
    email: str
    phone: str
    address: Optional[str] = None
    notes: Optional[str] = None
    role: str
    status: str
    permissions: dict
    created_at: datetime
    updated_at: Optional[datetime] = None


class EmployeeListResponse(BaseModel):
    employees: List[EmployeeResponse]
    total: int
