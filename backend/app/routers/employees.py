from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.auth.utils import get_current_active_user, TokenData, require_role
from app.auth.schemas import RoleEnum
from app.auth import service as auth_service
from app.models.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
)

router = APIRouter(prefix="/api/employees", tags=["employees"])


def employee_to_response(employee) -> EmployeeResponse:
    return EmployeeResponse(
        id=employee.id,
        username=employee.username,
        document_number=employee.document_number,
        first_name=employee.first_name,
        last_name=employee.last_name,
        email=employee.email,
        phone=employee.phone,
        address=employee.address,
        notes=employee.notes,
        role=employee.role.value,
        status=employee.status.value,
        permissions=employee.permissions.model_dump(),
        created_at=employee.created_at,
        updated_at=employee.updated_at,
    )


@router.get("", response_model=EmployeeListResponse)
async def get_employees(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None, description="Search by name or username"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: TokenData = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    employees = await auth_service.get_all_employees(db)

    if status_filter:
        employees = [e for e in employees if e.status.value == status_filter]

    if search:
        search_lower = search.lower()
        employees = [
            e
            for e in employees
            if search_lower in e.username.lower()
            or search_lower in e.first_name.lower()
            or search_lower in e.last_name.lower()
        ]

    total = len(employees)
    employees = employees[skip : skip + limit]

    return EmployeeListResponse(
        employees=[employee_to_response(e) for e in employees],
        total=total,
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: str,
    current_user: TokenData = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    employee = await auth_service.get_employee_by_id(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return employee_to_response(employee)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    employee_data: EmployeeCreate,
    current_user: TokenData = Depends(
        require_role([RoleEnum.ADMIN])
    ),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    from app.auth.schemas import EmployeeCreate as AuthEmployeeCreate, RoleEnum as AuthRoleEnum

    auth_employee = AuthEmployeeCreate(
        username=employee_data.username,
        document_number=employee_data.document_number,
        first_name=employee_data.first_name,
        last_name=employee_data.last_name,
        email=employee_data.email,
        phone=employee_data.phone,
        address=employee_data.address,
        notes=employee_data.notes,
        role=AuthRoleEnum(employee_data.role),
        password=employee_data.password,
    )

    try:
        employee = await auth_service.create_employee(db, auth_employee)
        return employee_to_response(employee)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: str,
    update_data: EmployeeUpdate,
    current_user: TokenData = Depends(
        require_role([RoleEnum.ADMIN, RoleEnum.RECEPCIONISTA])
    ),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    from app.auth.schemas import EmployeeUpdate as AuthEmployeeUpdate

    auth_update = AuthEmployeeUpdate(
        document_number=update_data.document_number,
        first_name=update_data.first_name,
        last_name=update_data.last_name,
        email=update_data.email,
        phone=update_data.phone,
        address=update_data.address,
        notes=update_data.notes,
        role=update_data.role,
        status=update_data.status,
    )

    employee = await auth_service.update_employee(db, employee_id, auth_update)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return employee_to_response(employee)


@router.put("/{employee_id}/permissions", response_model=EmployeeResponse)
async def update_employee_permissions(
    employee_id: str,
    permissions: dict,
    current_user: TokenData = Depends(require_role([RoleEnum.ADMIN])),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    from app.auth.schemas import RolePermissions

    role_permissions = RolePermissions(**permissions)

    employee = await auth_service.update_employee_permissions(
        db, employee_id, role_permissions
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return employee_to_response(employee)


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: str,
    current_user: TokenData = Depends(require_role([RoleEnum.ADMIN])),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    if current_user.username:
        employee = await auth_service.get_employee_by_id(db, employee_id)
        if employee and employee.username == current_user.username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account",
            )

    deleted = await auth_service.delete_employee(db, employee_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return None
