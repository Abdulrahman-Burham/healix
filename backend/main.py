"""
Healix — AI-Powered Healthcare & Fitness Platform
by DigitalMind

Backend: FastAPI + MongoDB + LangChain Multi-Agent + ChromaDB RAG
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import connect_db, close_db
from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.vitals_routes import router as vitals_router
from app.routes.exercise_routes import router as exercise_router
from app.routes.nutrition_routes import router as nutrition_router
from app.routes.medication_routes import router as medication_router
from app.routes.chat_routes import router as chat_router
from app.routes.prediction_routes import router as prediction_router
from app.routes.admin_routes import router as admin_router
from app.routes.smart_routes import router as smart_router
from app.routes.pose_routes import router as pose_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    print("🚀 Healix API is running")
    yield
    await close_db()


app = FastAPI(
    title="Healix API",
    description="AI-Powered Healthcare & Fitness Platform by DigitalMind",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=False,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(vitals_router, prefix="/api")
app.include_router(exercise_router, prefix="/api")
app.include_router(nutrition_router, prefix="/api")
app.include_router(medication_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(prediction_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(smart_router, prefix="/api")
app.include_router(pose_router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Healix API", "version": "1.0.0"}
