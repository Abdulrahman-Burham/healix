from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone
from app.models import ExerciseLog
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/exercises", tags=["Exercises"])


@router.get("/plan")
async def get_exercise_plan(user: dict = Depends(get_current_user)):
    """Get personalized exercise plan based on user profile."""
    db = get_db()
    plan = await db.exercise_plans.find_one({"user_id": user["id"]}, sort=[("created_at", -1)])
    if not plan:
        # Return default plan
        return {
            "exercises": [
                {"name": "Machine Shoulder Press", "name_ar": "مكينة كتف أمامي ضغط",
                 "sets": 4, "reps": 12, "warmup_sets": 1, "rest_seconds": 90,
                 "tips": "ثبّت ظهرك على المسند بالكامل، لا تقفل المرفق في الأعلى، نزّل لحد ما الذراع يوصل 90 درجة",
                 "tips_en": "Keep your back fully against the pad, don't lock elbows at top, lower until arms reach 90 degrees",
                 "alternatives": ["Dumbbell Shoulder Press", "Arnold Press"],
                 "muscle_group": "shoulders", "video_url": ""},
                {"name": "Chest Press Machine", "name_ar": "مكينة ضغط صدر",
                 "sets": 4, "reps": 10, "warmup_sets": 1, "rest_seconds": 90,
                 "tips": "اضغط لوحي الكتف للخلف، صدرك يكون مفتوح، لا ترفع كتفك وأنت تدفع",
                 "tips_en": "Squeeze shoulder blades back, chest open, don't shrug shoulders while pushing",
                 "alternatives": ["Bench Press", "Dumbbell Press"],
                 "muscle_group": "chest", "video_url": ""},
                {"name": "Hack Squat", "name_ar": "هاك سكوات",
                 "sets": 4, "reps": 10, "warmup_sets": 2, "rest_seconds": 120,
                 "tips": "القدمين على عرض الكتف أو أوسع شوي، انزل لحد ما الفخذ يوازي الأرض، ادفع من الكعب",
                 "tips_en": "Feet shoulder-width or slightly wider, lower until thighs parallel to floor, push through heels",
                 "alternatives": ["Leg Press", "Goblet Squat"],
                 "muscle_group": "legs", "video_url": ""},
                {"name": "Machine Lateral Raises", "name_ar": "رفرفة جانبية بالمكينة",
                 "sets": 3, "reps": 15, "warmup_sets": 0, "rest_seconds": 60,
                 "tips": "ارفع بالكوع مو باليد، لا ترفع فوق مستوى الكتف، ثبّت جسمك",
                 "tips_en": "Lift with elbows not hands, don't raise above shoulder level, keep body stable",
                 "alternatives": ["Dumbbell Lateral Raise", "Cable Lateral Raise"],
                 "muscle_group": "shoulders", "video_url": ""},
                {"name": "Overhead Tricep Extension", "name_ar": "تمديد خلفي للتراي فوق الرأس",
                 "sets": 3, "reps": 12, "warmup_sets": 0, "rest_seconds": 60,
                 "tips": "ثبّت المرفقين جنب الرأس، انزل ببطء، اضغط في الأعلى",
                 "tips_en": "Keep elbows close to head, lower slowly, squeeze at top",
                 "alternatives": ["Rope Pushdown", "Dips"],
                 "muscle_group": "arms", "video_url": ""},
                {"name": "Butterfly Machine", "name_ar": "فراشة صدر بالمكينة",
                 "sets": 3, "reps": 12, "warmup_sets": 0, "rest_seconds": 60,
                 "tips": "اضغط من الصدر مو الذراع، لا تخلي الأوزان ترجع بسرعة، حاول تحس بالعضلة",
                 "tips_en": "Press with chest not arms, don't let weights bounce back, focus on muscle connection",
                 "alternatives": ["Cable Fly", "Dumbbell Fly"],
                 "muscle_group": "chest", "video_url": ""},
            ],
            "user_level": user.get("fitness_level", "intermediate"),
            "safe_load_index": 78,
        }
    plan["_id"] = str(plan["_id"])
    return plan


@router.get("/today")
async def get_today_exercises(user: dict = Depends(get_current_user)):
    """Get today's exercise plan — alias for /plan."""
    return await get_exercise_plan(user)


@router.post("/log")
async def log_exercise(data: ExerciseLog, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = data.model_dump()
    doc["user_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.exercise_logs.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Exercise logged"}


@router.get("/history")
async def get_exercise_history(
    days: int = Query(7, ge=1, le=90),
    user: dict = Depends(get_current_user),
):
    db = get_db()
    from datetime import timedelta
    start = datetime.now(timezone.utc) - timedelta(days=days)
    cursor = db.exercise_logs.find(
        {"user_id": user["id"], "created_at": {"$gte": start}},
        sort=[("created_at", -1)],
    )
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        logs.append(doc)
    return logs
