# Gym Management System

Sistema SaaS de gestión integral para gimnasios. Multi-tenant con planes BASIC / PREMIUM, módulo POS, control de membresías, asistencia, inventario, empleados y reportes financieros.

---

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + TypeScript | 18 / 5.7 |
| Build | Vite | 7 |
| Routing | React Router | 7 |
| Charts | Recharts | 2 |
| PDF | html2canvas + jspdf | — |
| Backend | Python + FastAPI | 3.12 / 0.115 |
| Database | MongoDB (Motor async) | 7+ |
| Auth | JWT + bcrypt | — |
| Deployment | Vercel (FE) / Render (BE) | — |

---

## Architecture

```
┌──────────────┐      HTTPS       ┌──────────────┐      ┌──────────┐
│   Vercel     │ ───────────────▶ │    Render    │ ────▶ │ MongoDB  │
│  (React SPA) │                  │  (FastAPI)   │       │  Atlas   │
└──────────────┘                  └──────────────┘       └──────────┘
       │                                │
       │ React Router                   │ JWT Auth
       │ lazy() code splitting          │ Multi-tenant
       │ Context API                    │ Role-based
```

### Frontend Architecture

- **Code splitting**: cada página es un lazy-loaded chunk vía `React.lazy()`
- **State**: Context API (`AuthContext`, `ToastContext`) + `useReducer` para listas complejas
- **Hooks**: custom hooks separan lógica de negocio de la presentación (`usePOS`, `useTransactions`, `useCart`, etc.)
- **Services**: capa de API desacoplada en `src/services/`, todas pasan por `api.ts` que maneja tokens y base URL
- **Styles**: variables CSS globales + archivos por módulo (co-located cerca del componente que los usa)

### Backend Architecture

- **FastAPI** con routers modulares por dominio
- **AsyncIO** + Motor para MongoDB no bloqueante
- **JWT** en cookies HttpOnly + header Authorization
- **Multi-tenant** por `tenantId` en cada colección
- **Scheduler** interno para recordatorios WhatsApp (APScheduler)

---

## Route Map

| Path | Page | Component | Auth |
|------|------|-----------|------|
| `/` | Login | `Login` | — |
| `/register` | Register | `Register` | — |
| `/forgot-password` | Forgot Password | `ForgotPassword` | — |
| `/reset-password` | Reset Password | `ResetPassword` | — |
| `/renew` | Renew Subscription | `Renew` | — |
| `/terms` | Terms | `Terms` | — |
| `/privacy` | Privacy | `Privacy` | — |
| `/dashboard` | Dashboard | `Dashboard` | User |
| `/clients` | Register Client | `FormClients` | User |
| `/clients/register` | Register Client | `RegistetClient` | User |
| `/clients/list` | List Clients | `ListClients` | User |
| `/clients/:id` | Client Profile | `ClientProfile` | User |
| `/clients/edit/:id` | Edit Client | `FormClients` | User |
| `/products` | Products/Inventory | `Products` | User |
| `/sales` | POS + Sales | `SalesPages` | User |
| `/sales/pending` | Pending Subscriptions | `PendingSubscriptionsPage` | Premium |
| `/sales/config` | Business Config | `ConfigPage` | User |
| `/sales/list` | Sales History | `SalesListPage` | User |
| `/sales/invoices` | Invoices | `InvoiceListPage` | User |
| `/employees` | Employees | `EmployeesPage` | User |
| `/employees/:id` | Employee Profile | `EmployeeProfilePage` | User |
| `/financial` | Financial Report | `FinancialReport` | User |
| `/financial/dashboard` | Detailed Stats | `FinancialDashboard` | Premium |
| `/financial/monthly` | Monthly Report | `FinancialMonthlyReport` | Premium |
| `/attendance` | Attendance | `AttendancePage` | User |
| `/super-admin/dashboard` | SA Dashboard | `SuperAdminDashboard` | SuperAdmin |
| `/super-admin/tenants` | SA Tenants | `TenantListPage` | SuperAdmin |
| `/super-admin/tenants/:id` | SA Tenant Detail | `TenantDetailPage` | SuperAdmin |

---

## Features

### Clientes
- Registro con datos personales, contacto, emergencia, huella
- Perfil completo: membresía activa, estadísticas, historial
- Búsqueda por documento, nombre, teléfono
- Membresías: asignación, renovación, expiración automática
- Filtro por estado (ACTIVE / EXPIRED / NONE / SUSPENDED)

### Ventas (POS)
- Catálogo de productos + servicios
- Carrito con descuento por ítem, IVA calculado automáticamente
- Modal de venta con selección de cliente y método de pago
- Suscripciones pendientes (clientes sin membresía)
- Facturación electrónica con generación de PDF

### Productos / Inventario
- CRUD completo con categorías
- Control de stock mínimo
- Búsqueda y filtro por categoría

### Empleados
- Gestión de usuarios del gimnasio
- Roles: ADMIN, RECEPCIONISTA, ENTRENADOR
- Permisos granulares por módulo
- Perfil con datos de contacto

### Financiero
- Reporte diario de ingresos por empleado
- Desglose: servicios, bar, efectivo, transferencia
- Tablero premium con gráficos (barras, líneas)
- Reporte mensual con evolución diaria
- Vista anual con progreso por mes
- Edición de transacciones y comprobantes de pago

### Asistencia
- Registro de entrada por huella o documento
- Historial por fecha y cliente

### Multi-tenant / SuperAdmin
- Dashboard global con métricas de todos los tenants
- Lista de tenants con estado y plan
- Detalle del tenant: usuarios, suscripción, pagos
- Pago manual de suscripciones
- Suspensión / cancelación / reactivación de tenants
- Migración de datos localStorage → MongoDB integrada

### WhatsApp
- Mensajes automáticos de vencimiento de membresía
- Mensajes programados para promociones/fechas
- Variables dinámicas: `{nombre}`, `{fecha}`, `{negocio}`
- Scheduler interno para envío automático

---

## Directory Structure

```
src/
├── App.tsx                          # Entry point → AppRouter
├── main.tsx                         # Vite entry
│
├── router/
│   └── AppRouter.tsx                # All routes + lazy imports
│
├── pages/                           # Route-level components
│   ├── Login.tsx, Register.tsx, ForgotPassword.tsx
│   ├── ResetPassword.tsx, Renew.tsx
│   ├── Terms.tsx, Privacy.tsx
│   ├── Dashboard.tsx
│   ├── clients/                     (FormClients, RegistetClient, ListClients, ClientProfile)
│   ├── products/                    (Products)
│   ├── sales/                       (SalesPages, ConfigPage, InvoiceListPage, PendingSubscriptionsPage, SalesListPage)
│   ├── employees/                   (EmployeesPage, EmployeeProfilePage)
│   ├── admin/                       (FinancialReport, FinancialDashboard, FinancialMonthlyReport)
│   ├── attendance/                  (AttendancePage)
│   ├── payments/                    (PaymentModal)
│   └── superAdmin/                  (SuperAdminDashboard, TenantListPage, TenantDetailPage)
│
├── components/                      # Reusable UI
│   ├── common/                      (BackButton, Modal, ProtectedRoute, SuperAdminRoute, Toast)
│   ├── navbar/                      (Navbar.tsx — deprecated individual, now inline in components/)
│   ├── dashboard/                   (DashboardCard)
│   ├── clientsTable/                (ClientTable, ClientRow, ClientSearch)
│   ├── clientsModal/                (ClientModal)
│   ├── clientProfile/               (ClientInfo, ClientMembership, ClientStats)
│   ├── formClients/                 (ContactFields, EmergencyFields, PersonalDataFields)
│   ├── products/                    (ProductTable, ProductForm, ProductSearch)
│   ├── pos/                         (CartTable, CatalogList)
│   ├── sales/                       (SalesDashboard, SaleModal, MembershipModal, SubscriptionModal, PendingSubscriptions, EditVoucherModal)
│   ├── financial/                   (FinancialSummary, FinancialSummaryTable, FinancialTransactionsList, FinancialBarChart, FinancialLineChart, FinancialDashboardButton, TransactionEditModal)
│   ├── employees/                   (EmployeeTable, EmployeeForm, EmployeeSearch, EmployeePermissions, PasswordConfirmModal)
│   ├── whatsapp/                    (WhatsAppMessageModal)
│   └── superAdmin/                  (SuperAdminLayout, ManualPaymentModal, TenantStatusBadge)
│
├── hooks/                           # Custom hooks
│   ├── features/                    Feature-specific hooks:
│   │   ├── usePOS.ts               POS core logic (cart, catalog, clients)
│   │   ├── usePOSClients.ts        Client search & selection for POS
│   │   ├── usePOSSales.ts          Sale creation & invoice
│   │   └── usePOSSubscription.ts   Subscription assignment & payment
│   ├── useAccountType.ts            Demo / owner detection
│   ├── useCart.ts                   Shopping cart state
│   ├── useClientForm.ts             Client form state + validation
│   ├── useEmployees.ts              Employee data
│   ├── useListClientsHook.ts        Client list CRUD
│   ├── usePlanAccess.ts             Feature gating by plan
│   ├── useProducts.ts               Product CRUD
│   └── useTransactions.ts           Sales aggregation + reporting
│
├── services/                        # API layer
│   ├── api.ts                       Base fetch client + auth headers
│   ├── clients.service.ts
│   ├── products.service.ts
│   ├── sales.service.ts
│   ├── services.service.ts
│   ├── employees.service.ts
│   ├── employeePermissions.service.ts
│   ├── invoices.service.ts
│   ├── invoice.service.ts
│   ├── attendance.service.ts
│   ├── whatsapp.service.ts
│   └── adminTenants.service.ts
│
├── types/                           # TypeScript interfaces
│   ├── client.types.ts
│   ├── product.types.ts
│   ├── sales.types.ts
│   ├── pos.types.ts
│   ├── payment.types.ts
│   ├── employee.types.ts
│   ├── invoice.types.ts
│   ├── adminTenant.types.ts
│   ├── user.types.ts
│   ├── person.types.ts
│   └── dashboard.section.ts
│
├── utils/
│   ├── format/                      (currency.ts, number.ts)
│   ├── string/                      (normalize.ts — matchesQuery, normalizeDocument)
│   ├── invoicePdf.ts                PDF generation
│   └── ...                          see Dead Code section below
│
├── context/
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   ├── useAuth.ts
│   ├── ToastContext.tsx
│   └── ToastProvider.tsx
│
├── layouts/
│   └── MainLayout.tsx               Authenticated shell (navbar + outlet)
│
├── styles/
│   ├── variables.css                Design tokens (colors, spacing, fonts)
│   ├── base/                        Reset + base elements
│   ├── components/                  Button, form, badge shared styles
│   ├── layouts/                     Layout primitives
│   ├── navbar.css, pos.css, financial.css, config.css
│   ├── invoiceList.css, listClients.css, products.css
│   ├── common.css, dashboard.css, employees.css
│   ├── login.css, register.css, register-form.css
│   ├── attendance.css, paymentModal.css, clientsRegister.css
│   ├── modals/                      (clientModal.css, productModal.css)
│   ├── salesCSS/                    (SubscriptionModal.css, pendingSubscriptions.css)
│   └── clientProfileCss/            (ClientProfile.css)
│
└── tests/                           Vitest suite
    ├── setup.ts
    ├── auth.test.tsx
    ├── utils.test.ts
    ├── products.test.ts
    ├── array.test.ts
    ├── date.test.ts
    ├── format.test.ts
    ├── string.test.ts
    └── membership.test.ts
```

---

## Development

### Prerequisites
- Node.js 18+
- Python 3.11+ (3.12 recommended for deployment)
- MongoDB 6.0+ (or Atlas URI)

### Frontend
```bash
npm install
npm run dev              # http://localhost:5173
npm run build            # Production build → dist/
npm run preview          # Preview production build
npm run test             # Run Vitest suite
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # Windows
source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000
```

### Environment Variables

#### Frontend (`VITE_*`)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend base URL | Yes |

#### Backend (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URL` | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | Database name | Yes |
| `JWT_SECRET_KEY` | Token signing secret | Yes |

---

## Deployment

### Frontend → Vercel
1. Push to GitHub (`main` branch auto-deploys)
2. Set `VITE_API_URL=https://your-backend.onrender.com` in Vercel env vars
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend → Render
1. Create Web Service from GitHub repo
2. Root directory: `backend`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4. Set env vars: `MONGODB_URL`, `MONGODB_DB_NAME`, `JWT_SECRET_KEY`
5. Set `PYTHON_VERSION=3.12.9` in Render env vars (fixes TLS 1.3 issue with Atlas M2)

### Database → MongoDB Atlas
1. Create M2 cluster (free tier)
2. Network Access: add `0.0.0.0/0` (required for Render free tier dynamic IPs)
3. Database Access: create user with read/write permissions
4. Connection string: `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/gym_db?retryWrites=true&w=majority`

---

## Dead Code Inventory

Archivos presentes en `src/` que **no son importados por ningún archivo de producción** y son candidatos a limpieza.

### Components (6 files)

| File | Reason |
|------|--------|
| `src/components/clientProfile/ClientAttendance.tsx` | Stub vacío (`<div>ClientAttendance</div>`) |
| `src/components/clientProfile/ClientPayments.tsx` | Datos quemados, solo importado por ClientProfileModal (también muerto) |
| `src/components/clientsModal/ClientProfileModal.tsx` | No lo importa ningún componente activo |
| `src/components/common/Button.tsx` | Exportado desde barrel (`index.ts`) pero jamás importado |
| `src/components/common/SearchInput.tsx` | Exportado desde barrel pero jamás importado |
| `src/components/common/DecimalInput.tsx` | No importado por nadie |

### Hooks (1 file)

| File | Reason |
|------|--------|
| `src/hooks/useForm.ts` | Hook genérico de formularios con validación; bien diseñado pero sin uso en producción |

### Services (1 file)

| File | Reason |
|------|--------|
| `src/services/financialReports.service.ts` | Llama a endpoints `/api/reports/financial/*` que nunca se consumen desde el frontend. La app calcula reportes localmente desde transacciones. |

### Utils (6 files/directories)

| File | Reason |
|------|--------|
| `src/utils/authHelpers.ts` | Helpers `isDemoAccount`, `isOwner` — no usados (reemplazados por `useAccountType` hook y PlanAccess) |
| `src/utils/membership.ts` | `getDaysRemaining`, `getMembershipStatus` — solo importados en test. La función `getDaysRemaining` está re-definida inline en `ClientStats.tsx` |
| `src/utils/membership/` | `getMembershipDays` — nunca llamado en producción |
| `src/utils/migrate.js` | Script one-time de migración localStorage → MongoDB. No es código de producción; debería moverse a `backend/scripts/` o eliminarse |
| `src/utils/array/` | `filterBySearch`, `groupBy` — solo importados en test. Las funciones de agrupación reales están inline en `useTransactions.ts` |
| `src/utils/date/` | `parseDateInput`, `addDays` — solo importados en test |

### Barrel exports (never imported)

| File | Reason |
|------|--------|
| `src/components/common/index.ts` | Exporta `Button`, `SearchInput`, `Modal`. `Modal` se importa directo, no vía barrel. Nadie importa de este barrel. |
| `src/context/index.ts` | Re-exporta `AuthContext`, `AuthProvider`, `useAuth` — pero todos los imports van directo a los archivos individuales. |

### Total
**19 archivos/directorios muertos** sobre ~112 archivos fuente = **17% dead weight**.

---

## Key Design Decisions

### Table Responsiveness
- Mobile: `<table>` se convierte en cards vía `display: block` + `data-label` + `::before`
- Todas las tablas siguen el mismo patrón (Products, Sales, Clients, Invoices, Financial, Pending Subscriptions)
- Breakpoint único: `640px`

### Payment Methods
- `CASH`: efectivo
- `TRANSFER`: transferencia bancaria con comprobante
- `MIXED`: split entre efectivo y transferencia
- `MIXED` requiere ambos montos

### Membership Statuses
- `ACTIVE`: membresía vigente
- `EXPIRED`: vencida
- `NONE`: sin registrar (pendiente)
- `SUSPENDED`: suspendida por administración
- `CANCELLED`: cancelada

### Plans
- `BASIC`: 1 usuario, funcionalidades base
- `PREMIUM`: hasta 6 usuarios, dashboard financiero, suscripciones pendientes, WhatsApp
- `BETA`: plan gratuito de prueba (migración desde versión anterior)

### Auth Flow
1. Login con `email + password` + `businessCode`
2. Backend valida contra MongoDB, devuelve JWT + tenant info
3. Frontend almacena token en localStorage, adjunta via `Authorization` header
4. `ProtectedRoute` y `SuperAdminRoute` verifican existencia de token
5. Logout: llama `/api/auth/logout`, limpia localStorage, redirige a `/`

### Demo Mode
- Cuentas demo tienen campos deshabilitados en configuración
- WhatsApp visible pero sin poder guardar cambios
- Botón "Guardar Cambios" muestra alerta al intentar guardar
- Identificado por `localStorage.getItem("isDemo") === "true"` + backend check

---

## Scripts Reference

### Frontend
```bash
npm run dev          # Vite dev server (HMR)
npm run build        # tsc + vite build
npm run preview      # Preview production build
npm run test         # Vitest
```

### Backend
```bash
uvicorn app.main:app --reload                    # Dev server
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Production
python scripts/migrate_indexes.py                # Create missing MongoDB indexes
python scripts/migrate_indexes.py --dry-run       # Preview missing indexes
```

---

## Environment Troubleshooting

| Issue | Symptom | Fix |
|-------|---------|-----|
| **TLS error with Atlas M2** | `TLSV1_ALERT_INTERNAL_ERROR` on connection | Set `PYTHON_VERSION=3.12.9` env var on Render (forces TLS 1.2) |
| **IP whitelist** | Connection timeout to Atlas | Add `0.0.0.0/0` to Atlas Network Access |
| **Missing indexes** | `12 missing indexes` at startup | Run `python scripts/migrate_indexes.py` on Render Shell |
| **CORS error** | Browser blocks API calls | Verify `VITE_API_URL` is set in Vercel env vars |
| **Old cache after deploy** | Changes not visible | Hard refresh (`Ctrl+Shift+R`) |
