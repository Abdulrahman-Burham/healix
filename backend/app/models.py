from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────
class Gender(str, Enum):
    male = "male"
    female = "female"


class UserRole(str, Enum):
    user = "user"
    admin = "admin"


class FitnessLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class MedicationStatus(str, Enum):
    taken = "taken"
    missed = "missed"
    upcoming = "upcoming"
    late = "late"


# ── Auth ───────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# ── Onboarding ────────────────────────────────────────
class OnboardingData(BaseModel):
    age: Optional[int] = None
    gender: Optional[Gender] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    medical_conditions: list[str] = []
    current_medications: list[str] = []
    allergies: list[str] = []
    fitness_level: Optional[FitnessLevel] = None
    fitness_goals: list[str] = []
    workout_days_per_week: Optional[int] = None
    preferred_workout_time: Optional[str] = None
    sleep_hours: Optional[float] = None
    stress_level: Optional[int] = None
    diet_type: Optional[str] = None
    water_intake: Optional[float] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = None


# ── Vitals ─────────────────────────────────────────────
class VitalSigns(BaseModel):
    heart_rate: Optional[int] = None
    spo2: Optional[float] = None
    stress_level: Optional[int] = None
    steps: Optional[int] = None
    calories_burned: Optional[float] = None
    blood_pressure_sys: Optional[int] = None
    blood_pressure_dia: Optional[int] = None
    hrv: Optional[float] = None
    body_temp: Optional[float] = None
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[int] = None
    timestamp: Optional[datetime] = None


class VitalsUpload(BaseModel):
    data: list[VitalSigns]


# ── Exercise ──────────────────────────────────────────
class ExerciseLog(BaseModel):
    exercise_name: str
    exercise_name_ar: Optional[str] = None
    sets: int
    reps: int
    weight_kg: Optional[float] = None
    duration_minutes: Optional[float] = None
    calories_burned: Optional[float] = None
    completed: bool = False
    notes: Optional[str] = None


# ── Nutrition ─────────────────────────────────────────
class FoodItem(BaseModel):
    name: str
    name_ar: Optional[str] = None
    calories: float
    protein: float
    carbs: float
    fat: float
    quantity: Optional[str] = None


class MealLog(BaseModel):
    meal_type: str  # breakfast, lunch, dinner, snack, pre_workout
    meal_type_ar: Optional[str] = None
    foods: list[FoodItem]
    time: Optional[str] = None
    notes: Optional[str] = None


# ── Medication ────────────────────────────────────────
class MedicationCreate(BaseModel):
    name: str
    name_ar: Optional[str] = None
    dosage: str
    frequency: str
    frequency_ar: Optional[str] = None
    time: str
    instructions: Optional[str] = None
    instructions_ar: Optional[str] = None
    color: Optional[str] = "#06b6d4"


class MedicationUpdate(BaseModel):
    status: MedicationStatus
    taken_at: Optional[datetime] = None


# ── Chat ──────────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str
    agent: Optional[str] = None  # clinical, nutrition, exercise, risk


class ChatResponse(BaseModel):
    response: str
    agent: str
    sources: list[str] = []


# ── Admin ─────────────────────────────────────────────
class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    high_risk_users: int
    compliance_rate: float
    risk_distribution: dict
    alerts_by_type: list[dict]


# ── Predictions ───────────────────────────────────────
class PredictionRequest(BaseModel):
    scenario: Optional[str] = None


class PredictionResponse(BaseModel):
    current_risk: float
    predicted_risk: float
    risk_factors: list[dict]
    scenarios: list[dict]
    recommendations: list[str]
