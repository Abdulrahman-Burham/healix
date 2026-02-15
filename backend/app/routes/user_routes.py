from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timezone
from app.models import OnboardingData
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/onboarding")
async def complete_onboarding(data: OnboardingData, user: dict = Depends(get_current_user)):
    db = get_db()
    update_data = data.model_dump(exclude_none=True)
    update_data["onboarding_completed"] = True
    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": update_data})
    return {"message": "Onboarding completed successfully"}


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    # Return a complete profile with defaults for missing onboarding fields
    defaults = {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "user"),
        "age": user.get("age"),
        "gender": user.get("gender"),
        "weight": user.get("weight"),
        "height": user.get("height"),
        "medical_conditions": user.get("medical_conditions", []),
        "allergies": user.get("allergies", []),
        "blood_type": user.get("blood_type"),
        "fitness_level": user.get("fitness_level"),
        "fitness_goals": user.get("fitness_goals", []),
        "sleep_hours": user.get("sleep_hours"),
        "stress_level": user.get("stress_level"),
        "diet_type": user.get("diet_type"),
        "water_intake": user.get("water_intake"),
        "onboarding_completed": user.get("onboarding_completed", False),
    }
    return defaults


@router.put("/profile")
async def update_profile(data: dict, user: dict = Depends(get_current_user)):
    db = get_db()
    allowed_fields = [
        "name", "phone", "age", "gender", "weight", "height", "location",
        "medical_conditions", "allergies", "blood_type", "emergency_contact_name",
        "emergency_contact_phone", "emergency_contact_relation",
    ]
    update = {k: v for k, v in data.items() if k in allowed_fields}
    update["updated_at"] = datetime.now(timezone.utc)
    await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": update})
    return {"message": "Profile updated successfully"}
