from typing import Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.auth.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeInDB,
    RolePermissions,
    ModulePermission,
    StatusEnum,
)
from app.auth.utils import get_password_hash, verify_password
from app.database import get_database


def get_employee_collection(db: AsyncIOMotorDatabase):
    return db.employees


def get_default_permissions(role: str) -> RolePermissions:
    if role == "ADMIN":
        return RolePermissions(
            clients=ModulePermission(create=True, read=True, update=True, delete=True),
            employees=ModulePermission(create=True, read=True, update=True, delete=True),
            products=ModulePermission(create=True, read=True, update=True, delete=True),
            sales=ModulePermission(create=True, read=True, update=True, delete=True),
            reports=ModulePermission(create=True, read=True, update=True, delete=True),
            config=ModulePermission(create=True, read=True, update=True, delete=True),
        )
    elif role == "RECEPCIONISTA":
        return RolePermissions(
            clients=ModulePermission(create=True, read=True, update=True, delete=False),
            employees=ModulePermission(create=False, read=True, update=False, delete=False),
            products=ModulePermission(create=True, read=True, update=True, delete=False),
            sales=ModulePermission(create=True, read=True, update=True, delete=False),
            reports=ModulePermission(create=True, read=True, update=False, delete=False),
            config=ModulePermission(create=False, read=True, update=False, delete=False),
        )
    else:
        return RolePermissions(
            clients=ModulePermission(create=False, read=True, update=False, delete=False),
            employees=ModulePermission(create=False, read=False, update=False, delete=False),
            products=ModulePermission(create=False, read=True, update=False, delete=False),
            sales=ModulePermission(create=False, read=False, update=False, delete=False),
            reports=ModulePermission(create=False, read=False, update=False, delete=False),
            config=ModulePermission(create=False, read=False, update=False, delete=False),
        )


async def authenticate_user(
    db: AsyncIOMotorDatabase, username: str, password: str
) -> Optional[EmployeeInDB]:
    collection = get_employee_collection(db)
    user_doc = await collection.find_one({"username": username.lower()})

    if not user_doc:
        return None
    if not verify_password(password, user_doc["password_hash"]):
        return None
    if user_doc.get("status") == StatusEnum.INACTIVO.value:
        return None

    return EmployeeInDB(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        document_number=user_doc["document_number"],
        first_name=user_doc["first_name"],
        last_name=user_doc["last_name"],
        email=user_doc["email"],
        phone=user_doc["phone"],
        address=user_doc.get("address"),
        notes=user_doc.get("notes"),
        role=user_doc["role"],
        status=user_doc["status"],
        password_hash=user_doc["password_hash"],
        permissions=RolePermissions(**user_doc.get("permissions", {})),
        created_at=user_doc["created_at"],
        updated_at=user_doc.get("updated_at"),
    )


async def create_employee(
    db: AsyncIOMotorDatabase, employee: EmployeeCreate
) -> EmployeeInDB:
    collection = get_employee_collection(db)

    existing = await collection.find_one({"username": employee.username.lower()})
    if existing:
        raise ValueError("Username already exists")

    existing_email = await collection.find_one({"email": employee.email.lower()})
    if existing_email:
        raise ValueError("Email already exists")

    now = datetime.utcnow()
    permissions = get_default_permissions(employee.role.value)

    employee_dict = employee.model_dump()
    employee_dict["username"] = employee.username.lower()
    employee_dict["email"] = employee.email.lower()
    employee_dict["password_hash"] = get_password_hash(employee.password)
    employee_dict.pop("password")
    employee_dict["permissions"] = permissions.model_dump()
    employee_dict["created_at"] = now
    employee_dict["updated_at"] = None

    result = await collection.insert_one(employee_dict)

    return EmployeeInDB(
        id=str(result.inserted_id),
        username=employee_dict["username"],
        document_number=employee_dict["document_number"],
        first_name=employee_dict["first_name"],
        last_name=employee_dict["last_name"],
        email=employee_dict["email"],
        phone=employee_dict["phone"],
        address=employee_dict.get("address"),
        notes=employee_dict.get("notes"),
        role=employee_dict["role"],
        status=employee_dict["status"],
        password_hash=employee_dict["password_hash"],
        permissions=permissions,
        created_at=now,
        updated_at=None,
    )


async def get_employee_by_id(db: AsyncIOMotorDatabase, employee_id: str) -> Optional[EmployeeInDB]:
    collection = get_employee_collection(db)

    try:
        user_doc = await collection.find_one({"_id": ObjectId(employee_id)})
    except Exception:
        return None

    if not user_doc:
        return None

    return EmployeeInDB(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        document_number=user_doc["document_number"],
        first_name=user_doc["first_name"],
        last_name=user_doc["last_name"],
        email=user_doc["email"],
        phone=user_doc["phone"],
        address=user_doc.get("address"),
        notes=user_doc.get("notes"),
        role=user_doc["role"],
        status=user_doc["status"],
        password_hash=user_doc["password_hash"],
        permissions=RolePermissions(**user_doc.get("permissions", {})),
        created_at=user_doc["created_at"],
        updated_at=user_doc.get("updated_at"),
    )


async def get_employee_by_username(db: AsyncIOMotorDatabase, username: str) -> Optional[EmployeeInDB]:
    collection = get_employee_collection(db)
    user_doc = await collection.find_one({"username": username.lower()})

    if not user_doc:
        return None

    return EmployeeInDB(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        document_number=user_doc["document_number"],
        first_name=user_doc["first_name"],
        last_name=user_doc["last_name"],
        email=user_doc["email"],
        phone=user_doc["phone"],
        address=user_doc.get("address"),
        notes=user_doc.get("notes"),
        role=user_doc["role"],
        status=user_doc["status"],
        password_hash=user_doc["password_hash"],
        permissions=RolePermissions(**user_doc.get("permissions", {})),
        created_at=user_doc["created_at"],
        updated_at=user_doc.get("updated_at"),
    )


async def get_all_employees(db: AsyncIOMotorDatabase) -> list[EmployeeInDB]:
    collection = get_employee_collection(db)
    employees = []
    async for doc in collection.find().sort("created_at", -1):
        employees.append(
            EmployeeInDB(
                id=str(doc["_id"]),
                username=doc["username"],
                document_number=doc["document_number"],
                first_name=doc["first_name"],
                last_name=doc["last_name"],
                email=doc["email"],
                phone=doc["phone"],
                address=doc.get("address"),
                notes=doc.get("notes"),
                role=doc["role"],
                status=doc["status"],
                password_hash=doc["password_hash"],
                permissions=RolePermissions(**doc.get("permissions", {})),
                created_at=doc["created_at"],
                updated_at=doc.get("updated_at"),
            )
        )
    return employees


async def update_employee(
    db: AsyncIOMotorDatabase, employee_id: str, update_data: EmployeeUpdate
) -> Optional[EmployeeInDB]:
    collection = get_employee_collection(db)

    try:
        obj_id = ObjectId(employee_id)
    except Exception:
        return None

    update_dict = {
        k: v for k, v in update_data.model_dump().items() if v is not None
    }

    if "email" in update_dict:
        update_dict["email"] = update_dict["email"].lower()

    if not update_dict:
        return await get_employee_by_id(db, employee_id)

    update_dict["updated_at"] = datetime.utcnow()

    result = await collection.update_one({"_id": obj_id}, {"$set": update_dict})

    if result.modified_count == 0 and result.matched_count == 0:
        return None

    return await get_employee_by_id(db, employee_id)


async def update_employee_permissions(
    db: AsyncIOMotorDatabase,
    employee_id: str,
    permissions: RolePermissions,
) -> Optional[EmployeeInDB]:
    collection = get_employee_collection(db)

    try:
        obj_id = ObjectId(employee_id)
    except Exception:
        return None

    update_dict = {
        "permissions": permissions.model_dump(),
        "updated_at": datetime.utcnow(),
    }

    result = await collection.update_one({"_id": obj_id}, {"$set": update_dict})

    if result.matched_count == 0:
        return None

    return await get_employee_by_id(db, employee_id)


async def delete_employee(db: AsyncIOMotorDatabase, employee_id: str) -> bool:
    collection = get_employee_collection(db)

    try:
        obj_id = ObjectId(employee_id)
    except Exception:
        return False

    result = await collection.delete_one({"_id": obj_id})
    return result.deleted_count > 0
