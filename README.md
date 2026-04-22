# Gym Management System

Sistema completo de gestión de gimnasio con frontend React/TypeScript y backend FastAPI/MongoDB.

## Tecnologías

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router (navegación)
- Context API + useReducer (gestión de estado)
- CSS Modules / Variables CSS

### Backend
- Python 3.11 + FastAPI
- MongoDB (Motor async)
- JWT + bcrypt (autenticación)
- Pydantic (validación de datos)

## Estructura

```
gym-management/
├── src/                    # Frontend React
│   ├── pages/              # Páginas del sistema
│   ├── components/        # Componentes reutilizables
│   ├── hooks/             # Custom hooks
│   ├── services/          # Servicios API
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Utilidades
│   ├── styles/            # Estilos CSS
│   └── router/            # Configuración de rutas
├── backend/app/            # Backend FastAPI
│   ├── auth/              # Autenticación JWT
│   ├── models/            # Modelos MongoDB
│   └── routers/           # Endpoints API
└── dist/                  # Build de producción
```

## Funcionalidades

- **Clientes**: Registro, perfil, membresías, pagos
- **Empleados**: Gestión de empleados y permisos
- **Productos**: Inventario y ventas POS
- **Servicios**: Membresías y servicios adicionales
- **Asistencia**: Registro de entrada/salida
- **Reportes**: Estados financieros y reportes

## Setup

### Requisitos
- Node.js 18+
- Python 3.11+
- MongoDB 6.0+

### Instalación Frontend
```bash
npm install
npm run dev
```

### Instalación Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Variables de Entorno
```env
# Backend (.env)
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=gym_db
JWT_SECRET_KEY=your-secret-key
```

## Scripts

### Frontend
- `npm run dev` - Desarrollo
- `npm run build` - Build producción
- `npm run preview` - Preview producción
- `npm run test` - Ejecutar tests

### Backend
- `uvicorn app.main:app --reload` - Desarrollo
- `uvicorn app.main:app --host 0.0.0.0 --port 8000` - Producción