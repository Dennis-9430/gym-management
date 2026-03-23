from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.auth.router import router as auth_router
from app.routers.employees import router as employees_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(employees_router)


@app.get("/")
async def root():
    return {"message": "Gym Management API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api")
async def api_info():
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "clients": "/api/clients",
            "employees": "/api/employees",
            "products": "/api/products",
            "sales": "/api/sales",
            "services": "/api/services",
            "attendance": "/api/attendance",
            "reports": "/api/reports"
        }
    }
