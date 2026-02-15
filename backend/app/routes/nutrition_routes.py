from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from app.models import MealLog
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/nutrition", tags=["Nutrition"])


@router.get("/plan")
async def get_nutrition_plan(user: dict = Depends(get_current_user)):
    db = get_db()
    plan = await db.nutrition_plans.find_one({"user_id": user["id"]}, sort=[("created_at", -1)])
    if not plan:
        return {
            "daily_calories_target": 2200,
            "macros": {"protein": 165, "carbs": 250, "fat": 65},
            "water_target_liters": 3.0,
            "meals": [
                {
                    "type": "breakfast", "type_ar": "الفطور", "time": "07:30",
                    "foods": [
                        {"name": "Scrambled Eggs (3)", "name_ar": "بيض مخفوق (3)", "calories": 210, "protein": 18, "carbs": 2, "fat": 14},
                        {"name": "Oatmeal", "name_ar": "شوفان", "calories": 150, "protein": 5, "carbs": 27, "fat": 3},
                        {"name": "Banana", "name_ar": "موز", "calories": 105, "protein": 1, "carbs": 27, "fat": 0},
                    ],
                },
                {
                    "type": "lunch", "type_ar": "الغداء", "time": "13:00",
                    "foods": [
                        {"name": "Grilled Chicken (200g)", "name_ar": "دجاج مشوي (200 جم)", "calories": 330, "protein": 62, "carbs": 0, "fat": 7},
                        {"name": "Brown Rice", "name_ar": "أرز بني", "calories": 215, "protein": 5, "carbs": 45, "fat": 2},
                        {"name": "Mixed Salad", "name_ar": "سلطة مشكلة", "calories": 50, "protein": 2, "carbs": 10, "fat": 1},
                    ],
                },
                {
                    "type": "pre_workout", "type_ar": "قبل التمرين", "time": "16:30",
                    "foods": [
                        {"name": "Whey Protein Shake", "name_ar": "شيك بروتين", "calories": 120, "protein": 24, "carbs": 3, "fat": 1},
                        {"name": "Banana", "name_ar": "موز", "calories": 105, "protein": 1, "carbs": 27, "fat": 0},
                        {"name": "Dates (3 pieces)", "name_ar": "تمر (3 حبات)", "calories": 70, "protein": 1, "carbs": 18, "fat": 0},
                    ],
                },
                {
                    "type": "dinner", "type_ar": "العشاء", "time": "20:00",
                    "foods": [
                        {"name": "Salmon Fillet (180g)", "name_ar": "سلمون فيليه (180 جم)", "calories": 350, "protein": 40, "carbs": 0, "fat": 20},
                        {"name": "Sweet Potato", "name_ar": "بطاطا حلوة", "calories": 180, "protein": 4, "carbs": 41, "fat": 0},
                        {"name": "Steamed Vegetables", "name_ar": "خضار مطهوة", "calories": 80, "protein": 3, "carbs": 15, "fat": 1},
                    ],
                },
            ],
        }
    plan["_id"] = str(plan["_id"])
    return plan


@router.get("/today")
async def get_today_nutrition(user: dict = Depends(get_current_user)):
    """Get today's nutrition plan — alias for /plan."""
    return await get_nutrition_plan(user)


@router.post("/log")
async def log_meal(data: MealLog, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = data.model_dump()
    doc["user_id"] = user["id"]
    doc["date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.nutrition_logs.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Meal logged"}


@router.get("/history")
async def get_nutrition_history(
    days: int = Query(7, ge=1, le=90),
    user: dict = Depends(get_current_user),
):
    db = get_db()
    start = datetime.now(timezone.utc) - timedelta(days=days)
    cursor = db.nutrition_logs.find(
        {"user_id": user["id"], "created_at": {"$gte": start}},
        sort=[("created_at", -1)],
    )
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs
