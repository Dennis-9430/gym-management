# REALIZACIÓN DEL SISTEMA DE LOGIN

## Índice
1. [Arquitectura de Autenticación](#1-arquitectura-de-autenticación)
2. [Registro de Tenant (Gimnasio)](#2-registro-de-tenant-gimnasio)
3. [Login del Gerente/Owner](#3-login-del-gerenteowner)
4. [Creación de Empleados](#4-creación-de-empleados)
5. [Login de Empleados](#5-login-de-empleados)
6. [Roles y Permisos Implementados](#6-roles-y-permisos-implementados)
7. [Flujo Completo de Autenticación](#7-flujo-completo-de-autenticación)
8. [Validación de Status INACTIVE](#8-validación-de-status-inactive)
9. [Pruebas Realizadas](#9-pruebas-realizadas)

---

## 1. Arquitectura de Autenticación

### Dos Colecciones para Login

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
│                                                             │
│  ┌─────────────────┐        ┌─────────────────┐           │
│  │    employees    │        │      users      │           │
│  ├─────────────────┤        ├─────────────────┤           │
│  │ Datos personales│        │ Credenciales    │           │
│  │ - firstName     │        │ - username      │           │
│  │ - lastName      │        │ - password_hash │           │
│  │ - email         │        │ - role          │           │
│  │ - phone         │        │                 │           │
│  │ - role          │◄───────│ employeeId      │           │
│  │ - status        │   LINK │ (referencia)    │           │
│  │ - isOwner       │        │                 │           │
│  └─────────────────┘        └─────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Propósito de Cada Colección

| Colección | Propósito | Usa password? | Tiene status? |
|-----------|-----------|---------------|----------------|
| `employees` | Datos personales, rol, estado | ✅ Para login | ✅ **INACTIVE** |
| `users` | Login (vinculado via `employeeId`) | ✅ password_hash | ❌ No |

---

## 2. Registro de Tenant (Gimnasio)

### Flujo de Registro

```
USUARIO                      FRONTEND                      BACKEND
   │                              │                            │
   │─── Formulario de ────────────>│                            │
   │    Registro:                  │                            │
   │    - email                    │                            │
   │    - password                 │                            │
   │    - businessName             │                            │
   │    - ownerFirstName           │                            │
   │    - ownerLastName            │                            │
   │                              │────── POST /tenants/register ────>│
   │                              │                            │
   │                              │                            │ PASO 1: Validar email único
   │                              │                            │ PASO 2: Crear tenant en `tenants`
   │                              │                            │ PASO 3: Crear employee owner
   │                              │                            │        - role: "ADMIN"
   │                              │                            │        - isOwner: true
   │                              │                            │        - status: "ACTIVE"
   │                              │                            │ PASO 4: Crear user en `users`
   │                              │                            │        - Vincular via employeeId
   │                              │                            │        - password_hash con bcrypt
   │                              │                            │ PASO 5: Generar JWT token
   │                              │                            │
   │                              │<──────── TenantResponse ────│
   │                              │    + accessToken           │
   │<──── Login Exitoso ──────────│                            │
   │      JWT Token              │                            │
```

### Datos Creados en Registro

**Tenant:**
```json
{
  "tenantId": "uuid-generado",
  "email": "gimnasio@email.com",
  "businessName": "Mi Gimnasio",
  "plan": "BASIC",
  "subscriptionStatus": "ACTIVE",
  "ownerEmployeeId": "id-del-owner-creado"
}
```

**Employee (Owner):**
```json
{
  "tenantId": "uuid-del-tenant",
  "username": "gimnasio@email.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "gimnasio@email.com",
  "role": "ADMIN",
  "status": "ACTIVE",
  "isOwner": true
}
```

**User (para login):**
```json
{
  "username": "gimnasio@email.com",
  "password_hash": "$2b$12$...",
  "role": "ADMIN",
  "employeeId": "id-del-employee",
  "tenantId": "uuid-del-tenant",
  "isOwner": true
}
```

### Endpoint de Registro

```python
# backend/app/routers/tenants.py

@router.post("/register")
async def register_tenant(data: TenantCreate):
    """Registro de nuevo tenant con owner automático"""
    
    # 1. Crear tenant
    tenant_data = {
        "tenantId": tenant_id,
        "email": data.email,
        "businessName": data.businessName,
        "plan": data.plan,
        "subscriptionStatus": SubscriptionStatus.ACTIVE,
    }
    tenant_result = await db.tenants.insert_one(tenant_data)
    
    # 2. Crear employee owner
    owner_data = {
        "tenantId": tenant_id,
        "username": data.email,
        "firstName": data.ownerFirstName,
        "lastName": data.ownerLastName,
        "email": data.email,
        "role": "ADMIN",
        "status": "ACTIVE",
        "isOwner": True,
        "password": get_password_hash(data.password),  # Hash bcrypt
    }
    owner_result = await db.employees.insert_one(owner_data)
    
    # 3. Crear user para login (vinculado al employee)
    await db.users.insert_one({
        "username": data.email.lower(),
        "password_hash": get_password_hash(data.password),
        "role": "ADMIN",
        "employeeId": str(owner_result.inserted_id),
        "tenantId": tenant_id,
        "isOwner": True,
    })
    
    # 4. Retornar JWT
    return TenantLoginResponse(
        accessToken=create_access_token(data),
        tenant=TenantResponse(...)
    )
```

---

## 3. Login del Gerente/Owner

### Flujo de Login

```
GERENTE                       FRONTEND                      BACKEND
   │                              │                            │
   │─── email + password ─────────>│                            │
   │                              │──── POST /tenants/login ──────>│
   │                              │                            │
   │                              │                            │ 1. Buscar employee por email
   │                              │                            │    (SIN filtro de status)
   │                              │                            │
   │                              │                            │ 2. Verificar status != "INACTIVE"
   │                              │                            │
   │                              │                            │ 3. Verificar password (bcrypt)
   │                              │                            │
   │                              │                            │ 4. Crear JWT con:
   │                              │                            │    - sub: email
   │                              │                            │    - role: ADMIN
   │                              │                            │    - tenantId: uuid
   │                              │                            │    - isOwner: true  ◄── IMPORTANTE
   │                              │                            │
   │                              │<──────── JWT + Tenant ─────│
   │                              │                            │
   │<──── Redirección ────────────│                            │
   │      al Dashboard            │                            │
```

### Endpoint de Login

```python
# backend/app/routers/tenants.py

@router.post("/login")
async def login_tenant(data: TenantLoginRequest):
    db = get_database()
    
    # 1. Buscar employee (SIN filtro status para detectar INACTIVE)
    employee = await db.employees.find_one({
        "$or": [
            {"email": login_query},
            {"username": login_query}
        ]
    })
    
    # 2. Si existe, verificar SI está INACTIVE
    if employee and employee.get("status") == "INACTIVE":
        raise HTTPException(
            status_code=403,
            detail="Tu cuenta está INACTIVA. Contacta al administrador."
        )
    
    # 3. Si no existe, buscar en tenants legacy
    if not employee:
        tenant = await db.tenants.find_one({"email": login_query})
        if tenant and verify_password(data.password, tenant["password"]):
            employee = { ... crear employee temporal ... }
        else:
            raise HTTPException(401, "Credenciales incorrectas")
    
    # 4. Verificar password del employee
    if not verify_password(data.password, employee["password"]):
        raise HTTPException(401, "Credenciales incorrectas")
    
    # 5. Crear JWT con isOwner=true
    token_data = {
        "sub": employee["email"],
        "role": employee["role"],
        "tenantId": tenant["tenantId"],
        "isOwner": employee.get("isOwner", False),  # true para owner
    }
    
    return TenantLoginResponse(
        accessToken=create_access_token(token_data),
        tenant=...
    )
```

### JWT Token Creado

```json
{
  "sub": "gerente@gimnasio.com",
  "role": "ADMIN",
  "tenantId": "uuid-del-tenant",
  "plan": "BASIC",
  "employeeId": "id-del-owner",
  "isOwner": true  ◄── Este flag identifica al Gerente
}
```

---

## 4. Creación de Empleados

### Permisos para Crear Empleados

| Rol que crea | Puede crear | Notas |
|-------------|-------------|-------|
| **GERENTE (Owner)** | ADMIN, RECEPCIONISTA | Puede crear cualquier empleado |
| **ADMIN** | RECEPCIONISTA | Solo recepcionistas, no otros admins |
| **RECEPCIONISTA** | ❌ Nadie | No puede crear empleados |

### Flujo de Creación

```
ADMIN/GERENTE                 FRONTEND                      BACKEND
   │                              │                            │
   │─── Formulario de ────────────>│                            │
   │    Empleado:                  │                            │
   │    - username                 │                            │
   │    - email                    │                            │
   │    - firstName                │                            │
   │    - lastName                 │                            │
   │    - role: "ADMIN" o          │                            │
   │      "RECEPCIONISTA"          │                            │
   │    - password                 │                            │
   │                              │────── POST /employees ────────>│
   │                              │                            │
   │                              │                            │ 1. Validar permisos del solicitante
   │                              │                            │ 2. Validar que el rol sea válido
   │                              │                            │ 3. Hash password con bcrypt
   │                              │                            │ 4. Insertar en `employees`
   │                              │                            │ 5. Insertar en `users`
   │                              │                            │    (para que pueda hacer login)
   │                              │                            │
   │                              │<──── EmployeeResponse ─────│
   │<──── Empleado Creado ────────│                            │
```

### Endpoint de Creación

```python
# backend/app/routers/employees.py

@router.post("")
async def create_employee(
    employee_data: EmployeeCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    db = get_database()
    
    # 1. Verificar permisos (ADMIN o Owner pueden crear)
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(403, "Solo admins pueden crear empleados")
    
    # 2. Admin no puede crear otro Admin
    if current_user.role == UserRole.ADMIN and not current_user.isOwner:
        if employee_data.role == EmployeeRole.ADMIN:
            raise HTTPException(403, "No puedes crear otro admin")
    
    # 3. Crear employee
    employee_doc = {
        "tenantId": current_user.tenantId,
        "username": employee_data.username.lower(),
        "email": employee_data.email.lower(),
        "firstName": employee_data.firstName,
        "lastName": employee_data.lastName,
        "role": employee_data.role.value,
        "status": "ACTIVE",
        "isOwner": False,
        "password": get_password_hash(employee_data.password),
        "createdAt": datetime.utcnow(),
    }
    result = await db.employees.insert_one(employee_doc)
    
    # 4. Crear user en colección `users` (para login)
    await db.users.insert_one({
        "username": employee_data.username.lower(),
        "password_hash": get_password_hash(employee_data.password),
        "role": employee_data.role.value,
        "employeeId": str(result.inserted_id),
        "tenantId": current_user.tenantId,
        "isOwner": False,
    })
    
    return EmployeeResponse(**serialize_employee(employee_doc))
```

---

## 5. Login de Empleados

### Flujo de Login de Empleado

```
EMPLEADO                       FRONTEND                      BACKEND
   │                              │                            │
   │─── email + password ─────────>│                            │
   │                              │──── POST /tenants/login ──────>│
   │                              │                            │
   │                              │                            │ 1. Buscar employee por email
   │                              │                            │ 2. Verificar status
   │                              │                            │    - Si "INACTIVE" → 403
   │                              │                            │    - Si "ACTIVE" → continuar
   │                              │                            │ 3. Verificar password
   │                              │                            │
   │                              │                            │ 4. Crear JWT con:
   │                              │                            │    - sub: email
   │                              │                            │    - role: RECEPCIONISTA o ADMIN
   │                              │                            │    - isOwner: false  ◄──
   │                              │                            │
   │                              │<──────── JWT + Tenant ─────│
   │                              │                            │
   │<──── Redirección ────────────│                            │
   │      al Dashboard            │                            │
```

### JWT Token para Empleado

**Empleado Admin:**
```json
{
  "sub": "admin@gimnasio.com",
  "role": "ADMIN",
  "tenantId": "uuid-del-tenant",
  "employeeId": "id-del-admin",
  "isOwner": false  ◄── Diferencia clave vs Owner
}
```

**Recepcionista:**
```json
{
  "sub": "recepcionista@gimnasio.com",
  "role": "RECEPCIONISTA",
  "tenantId": "uuid-del-tenant",
  "employeeId": "id-del-recepcionista",
  "isOwner": false
}
```

---

## 6. Roles y Permisos Implementados

### Jerarquía de Roles

```
                    ┌─────────────────┐
                    │     GERENTE     │
                    │   isOwner: true │
                    │   role: ADMIN   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ┌─────────┐   ┌─────────┐   ┌─────────────┐
        │  ADMIN  │   │  ADMIN  │   │RECEPCIONISTA│
        │(empleado)│   │(empleado)│   │             │
        │isOwner: │   │isOwner: │   │isOwner:     │
        │  false  │   │  false  │   │  false      │
        └─────────┘   └─────────┘   └─────────────┘
```

### Permisos Detallados

#### GERENTE (Owner)
```
┌─────────────────────────────────────────────────────┐
│ ACCIONES                                         │ GERENTE │
├─────────────────────────────────────────────────────┼─────────┤
│ EMPLEADOS                                          │         │
│   - Ver todos los empleados                        │    ✅    │
│   - Crear empleados (ADMIN y RECEPCIONISTA)        │    ✅    │
│   - Editar cualquier empleado                      │    ✅    │
│   - Eliminar cualquier empleado                    │    ✅    │
│   - Cambiar status (ACTIVE/INACTIVE)              │    ✅    │
│   - Ver/editar permisos de empleados               │    ✅    │
├─────────────────────────────────────────────────────┼─────────┤
│ CLIENTES                                           │         │
│   - Ver todos                                      │    ✅    │
│   - Crear                                          │    ✅    │
│   - Editar                                         │    ✅    │
│   - Eliminar                                       │    ✅    │
├─────────────────────────────────────────────────────┼─────────┤
│ DASHBOARD                                          │         │
│   - Ver todas las secciones                        │    ✅    │
│   - Reporte Financiero (PREMIUM)                   │    ✅    │
│   - Registro de Personal                           │    ✅    │
└─────────────────────────────────────────────────────┘
```

#### ADMIN (Empleado)
```
┌─────────────────────────────────────────────────────┐
│ ACCIONES                                         │ ADMIN   │
├─────────────────────────────────────────────────────┼─────────┤
│ EMPLEADOS                                          │         │
│   - Ver todos los empleados                        │    ✅    │
│   - Crear SOLO RECEPCIONISTAS                      │    ✅    │
│   - Editar SOLO RECEPCIONISTAS                     │    ✅    │
│   - Eliminar SOLO RECEPCIONISTAS                   │    ✅    │
│   - ❌ NO puede crear/editar admins                 │    ❌    │
│   - ❌ NO puede editar/eliminar al owner            │    ❌    │
├─────────────────────────────────────────────────────┼─────────┤
│ CLIENTES                                           │         │
│   - Ver todos                                      │    ✅    │
│   - Crear                                          │    ✅    │
│   - Editar                                         │    ✅    │
│   - Eliminar                                       │    ✅    │
├─────────────────────────────────────────────────────┼─────────┤
│ DASHBOARD                                          │         │
│   - Ver todas las secciones                        │    ✅    │
│   - Reporte Financiero (PREMIUM)                   │    ✅    │
│   - Registro de Personal                           │    ✅    │
└─────────────────────────────────────────────────────┘
```

#### RECEPCIONISTA
```
┌─────────────────────────────────────────────────────┐
│ ACCIONES                                       │RECEPCION│
├─────────────────────────────────────────────────────┼─────────┤
│ EMPLEADOS                                          │         │
│   - Ver todos (solo nombres, sin permisos)         │    ✅    │
│   - ❌ Crear                                        │    ❌    │
│   - ❌ Editar                                       │    ❌    │
│   - ❌ Eliminar                                     │    ❌    │
│   - ❌ Ver sección de permisos                      │    ❌    │
├─────────────────────────────────────────────────────┼─────────┤
│ CLIENTES                                           │         │
│   - Ver todos                                      │    ✅    │
│   - Crear                                          │    ✅    │
│   - Editar                                         │    ✅    │
│   - ❌ Eliminar                                     │    ❌    │
├─────────────────────────────────────────────────────┼─────────┤
│ DASHBOARD                                          │         │
│   - ❌ Reporte Financiero                          │    ❌    │
│   - ❌ Registro de Personal                        │    ❌    │
│   - ✅ Registro de Pago Diario                     │    ✅    │
│   - ✅ Usuarios/Clientes                          │    ✅    │
│   - ✅ Ventas                                      │    ✅    │
└─────────────────────────────────────────────────────┘
```

### Implementación en Frontend

```typescript
// hooks/useAccountType.ts
export const useAccountType = () => {
  const { user } = useAuth();
  const payload = decodeToken(user?.token);
  
  const isOwner = payload?.isOwner === true;
  const isAdmin = payload?.role === "ADMIN";
  const isRecepcionista = payload?.role === "RECEPCIONISTA";
  
  return { isOwner, isAdmin, isRecepcionista };
};
```

```typescript
// components/employees/EmployeeTable.tsx
const { isOwner, isAdmin } = useAccountType();

const canEdit = isOwner 
  ? true 
  : (isAdmin && isEmployeeRecepcionista);

const canDelete = isOwner 
  ? !isEmployeeOwner  // No puede eliminarse a sí mismo
  : (isAdmin && isEmployeeRecepcionista);
```

---

## 7. Flujo Completo de Autenticación

### Registro → Login → Permisos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. REGISTRO                                                      │
│    User → /tenants/register                                      │
│    ├── Crea tenant                                               │
│    ├── Crea employee (isOwner=true, role=ADMIN)                 │
│    ├── Crea user (vinculado via employeeId)                     │
│    └── Retorna JWT con isOwner=true                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. LOGIN GERENTE                                                 │
│    Gerente → /tenants/login                                      │
│    ├── Busca employee por email                                  │
│    ├── Verifica status != "INACTIVE"                            │
│    ├── Verifica password                                         │
│    └── Retorna JWT con isOwner=true                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CREAR EMPLEADO ADMIN                                          │
│    Gerente → POST /employees                                    │
│    ├── Inserta employee (role=ADMIN, isOwner=false)             │
│    ├── Inserta user (vinculado)                                 │
│    └── Admin puede ahora hacer login                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. LOGIN ADMIN                                                   │
│    Admin → /tenants/login                                       │
│    ├── Busca employee por email                                 │
│    ├── Verifica status                                          │
│    └── Retorna JWT con isOwner=false, role=ADMIN                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. CREAR RECEPCIONISTA                                           │
│    Admin → POST /employees                                       │
│    ├── Inserta employee (role=RECEPCIONISTA, isOwner=false)    │
│    ├── Inserta user (vinculado)                                  │
│    └── Recepcionista puede ahora hacer login                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. LOGIN RECEPCIONISTA                                           │
│    Recepcionista → /tenants/login                               │
│    ├── Busca employee por email                                  │
│    ├── Verifica status                                          │
│    └── Retorna JWT con isOwner=false, role=RECEPCIONISTA        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Validación de Status INACTIVE

### Comportamiento

| Status | Puede hacer Login | Visible en Listas | Descripción |
|--------|-------------------|-------------------|-------------|
| `ACTIVE` | ✅ Sí | ✅ Sí | Empleado trabajando normalmente |
| `INACTIVE` | ❌ 403 Forbidden | ✅ Sí | Cuenta bloqueada, no puede login |
| `SUSPENDED` | ❌ (pendiente impl.) | ✅ Sí | Cuenta suspendida temporalmente |

### Flujo de Bloqueo INACTIVE

```
EMPLEADO (INACTIVE)            BACKEND                         FRONTEND
      │                              │                              │
      │─── Login ──────────────────────>│                              │
      │    email: inactivo@gym.com    │                              │
      │    password: ***              │                              │
      │                              │ 1. Buscar employee             │
      │                              │ 2. employee.status == "INACTIVE"│
      │                              │ 3. → HTTP 403                  │
      │                              │                              │
      │<─── 403 Forbidden ───────────│                              │
      │      { "detail": "Tu cuenta   │                              │
      │        está INACTIVA.         │                              │
      │        Contacta al            │                              │
      │        administrador." }       │                              │
      │                              │                              │
      │                              │                              │
      ▼                              ▼                              ▼
      
      Se muestra el mensaje         Backend retorna 403          User ve el
      de error en pantalla          con mensaje específico       mensaje de error
```

### Implementación Backend

```python
# backend/app/routers/tenants.py

@router.post("/login")
async def login_tenant(data: TenantLoginRequest):
    employee = await db.employees.find_one({
        "$or": [{"email": email}, {"username": username}]
        # NOTA: NO filtrar por status aquí para poder detectarlo
    })
    
    # Verificar SI está INACTIVE antes de verificar password
    if employee and employee.get("status") == "INACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta está INACTIVA. Contacta al administrador."
        )
    
    # Continuar con verificación de password...
```

### Implementación Frontend

```typescript
// src/pages/Login.tsx

try {
  const response = await fetch(`${apiUrl}/api/tenants/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Credenciales incorrectas");
  }
  
  // Login exitoso...
} catch (err) {
  setError(err.message);  // Muestra el mensaje del backend
}
```

---

## 9. Pruebas Realizadas

### Prueba 1: Registro de Tenant

```
Input:
{
  "email": "test-gym@email.com",
  "password": "password123",
  "businessName": "Gimnasio Test",
  "ownerFirstName": "Carlos",
  "ownerLastName": "Mendoza",
  "plan": "BASIC"
}

Resultado Esperado:
- Tenant creado en MongoDB
- Employee owner creado con isOwner=true
- User creado en colección users
- JWT retornado con isOwner=true
```

### Prueba 2: Login de Owner/Gerente

```
Input:
{
  "email": "test-gym@email.com",
  "password": "password123"
}

Resultado Esperado:
- Login exitoso
- JWT contiene: isOwner=true, role=ADMIN
- Frontend reconoce como Owner
```

### Prueba 3: Creación de Admin por Owner

```
Input (Owner logueado):
{
  "username": "admin2",
  "email": "admin2@gym.com",
  "firstName": "María",
  "lastName": "López",
  "role": "ADMIN",
  "password": "admin123"
}

Resultado Esperado:
- Admin creado
- Visible en lista de empleados
- Puede hacer login
```

### Prueba 4: Login de Admin

```
Input:
{
  "email": "admin2@gym.com",
  "password": "admin123"
}

Resultado Esperado:
- Login exitoso
- JWT contiene: isOwner=false, role=ADMIN
- Dashboard muestra todas las secciones
```

### Prueba 5: Creación de Recepcionista por Admin

```
Input (Admin logueado):
{
  "username": "recep1",
  "email": "recep1@gym.com",
  "firstName": "Pedro",
  "lastName": "García",
  "role": "RECEPCIONISTA",
  "password": "recep123"
}

Resultado Esperado:
- Recepcionista creado
- Visible en lista de empleados
- Puede hacer login
```

### Prueba 6: Login de Recepcionista

```
Input:
{
  "email": "recep1@gym.com",
  "password": "recep123"
}

Resultado Esperado:
- Login exitoso
- JWT contiene: isOwner=false, role=RECEPCIONISTA
- Dashboard filtra secciones (no ve Reportes ni Personal)
```

### Prueba 7: Cambio de Status a INACTIVE

```
Acción:
1. Owner abre lista de empleados
2. Edita empleado "recep1"
3. Cambia status a "INACTIVE"
4. Guarda

Resultado Esperado:
- Empleado permanece en lista (visible)
- Status actualizado a "INACTIVE" en MongoDB
- No se oculta de la lista
```

### Prueba 8: Login con Cuenta INACTIVE

```
Input:
{
  "email": "recep1@gym.com",
  "password": "recep123"
}

Resultado Esperado:
- Login FALLIDO
- HTTP 403 Forbidden
- Mensaje: "Tu cuenta está INACTIVA. Contacta al administrador."
```

### Prueba 9: Permisos de Admin en Tabla de Empleados

```
Escenario:
- Admin logueado
- Lista de empleados muestra 3 personas:
  1. Owner (isOwner=true)
  2. Admin (isOwner=false, role=ADMIN)
  3. Recepcionista (role=RECEPCIONISTA)

Resultado Esperado:
- ❌ Botón "Editar" NO visible en Owner
- ❌ Botón "Editar" NO visible en Admin
- ✅ Botón "Editar" visible en Recepcionista
- ❌ Botón "Eliminar" NO visible en Owner
- ❌ Botón "Eliminar" NO visible en Admin
- ✅ Botón "Eliminar" visible en Recepcionista
```

### Prueba 10: Permisos de Owner en Tabla de Empleados

```
Escenario:
- Owner/Gerente logueado
- Lista de empleados muestra 3 personas

Resultado Esperado:
- ✅ Botón "Editar" visible en TODOS
- ✅ Botón "Eliminar" visible en Admin y Recepcionista
- ❌ Botón "Eliminar" NO visible en sí mismo (Owner)
```

---

## Resumen de Archivos Modificados

### Backend
| Archivo | Cambio |
|---------|--------|
| `app/models/employee.py` | Agregado `EmployeeStatus` enum |
| `app/routers/tenants.py` | Login mejorado con validación INACTIVE |
| `app/routers/employees.py` | Creación vinculada con colección `users` |
| `app/auth/service.py` | Validación INACTIVE en autenticación |
| `app/auth/schemas.py` | Campo `isInactive` en UserResponse |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `src/hooks/useAccountType.ts` | Export `isAdmin`, `isRecepcionista` |
| `src/types/dashboard.section.ts` | Hook `useFilteredSections()` |
| `src/components/employees/EmployeeTable.tsx` | Permisos por rol |
| `src/pages/Dashboard.tsx` | Filtrado de secciones |
| `src/services/employees.service.ts` | Sin filtro `?status=ACTIVE` |

---

*Documento generado: Mayo 2026*
*Versión: 1.0*
