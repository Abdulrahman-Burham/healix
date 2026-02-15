"""
Healix — Live Exercise Pose Tracking API
Saves pose session results and provides exercise form rules.
Pose detection runs client-side via MediaPipe Vision (WASM).
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/pose", tags=["Pose Tracking"])


# ── Models ─────────────────────────────────────────────

class PoseSessionResult(BaseModel):
    exercise_name: str
    exercise_name_ar: Optional[str] = None
    total_reps: int = 0
    good_reps: int = 0
    bad_reps: int = 0
    avg_form_score: float = 0.0
    duration_seconds: float = 0.0
    calories_burned: float = 0.0
    feedback: list[str] = []


# ── Exercise angle rules for client-side validation ────
# The frontend uses these to check form correctness per exercise.

EXERCISE_RULES = {
    "squat": {
        "name": "Squat",
        "name_ar": "سكوات",
        "joints": {
            "left_knee": {"min": 70, "max": 170, "ideal_bottom": 90},
            "right_knee": {"min": 70, "max": 170, "ideal_bottom": 90},
            "left_hip": {"min": 60, "max": 170, "ideal_bottom": 80},
            "right_hip": {"min": 60, "max": 170, "ideal_bottom": 80},
        },
        "rep_joint": "left_knee",
        "rep_threshold_down": 110,
        "rep_threshold_up": 155,
        "tips": [
            "Keep knees aligned with toes",
            "Back straight, chest up",
            "Go at least to parallel (90° knee angle)",
            "Push through your heels",
        ],
        "tips_ar": [
            "حافظ على الركبة في اتجاه أصابع القدم",
            "الظهر مستقيم والصدر مرفوع",
            "انزل على الأقل للتوازي (زاوية ركبة 90°)",
            "ادفع من الكعب",
        ],
    },
    "push_up": {
        "name": "Push Up",
        "name_ar": "ضغط",
        "joints": {
            "left_elbow": {"min": 45, "max": 170, "ideal_bottom": 90},
            "right_elbow": {"min": 45, "max": 170, "ideal_bottom": 90},
        },
        "rep_joint": "left_elbow",
        "rep_threshold_down": 100,
        "rep_threshold_up": 155,
        "tips": [
            "Keep your body in a straight line",
            "Elbows at 45° angle from body",
            "Go down until chest nearly touches floor",
            "Full extension at top",
        ],
        "tips_ar": [
            "حافظ على جسمك في خط مستقيم",
            "المرفقين بزاوية 45° من الجسم",
            "انزل حتى يقترب صدرك من الأرض",
            "فرد كامل في الأعلى",
        ],
    },
    "bicep_curl": {
        "name": "Bicep Curl",
        "name_ar": "باي كيرل",
        "joints": {
            "left_elbow": {"min": 30, "max": 170, "ideal_bottom": 40},
            "right_elbow": {"min": 30, "max": 170, "ideal_bottom": 40},
        },
        "rep_joint": "left_elbow",
        "rep_threshold_down": 140,
        "rep_threshold_up": 50,
        "tips": [
            "Keep elbows pinned to your sides",
            "Don't swing your body",
            "Squeeze at the top",
            "Control the negative (lowering phase)",
        ],
        "tips_ar": [
            "ثبت المرفقين على جنبيك",
            "لا تتأرجح بجسمك",
            "اضغط في الأعلى",
            "تحكم في النزول (المرحلة السلبية)",
        ],
    },
    "shoulder_press": {
        "name": "Shoulder Press",
        "name_ar": "ضغط كتف",
        "joints": {
            "left_elbow": {"min": 60, "max": 175, "ideal_bottom": 90},
            "right_elbow": {"min": 60, "max": 175, "ideal_bottom": 90},
            "left_shoulder": {"min": 60, "max": 175, "ideal_bottom": 90},
            "right_shoulder": {"min": 60, "max": 175, "ideal_bottom": 90},
        },
        "rep_joint": "left_elbow",
        "rep_threshold_down": 100,
        "rep_threshold_up": 160,
        "tips": [
            "Don't arch your back excessively",
            "Press straight up, not forward",
            "Lower to ear level",
            "Keep core tight",
        ],
        "tips_ar": [
            "لا تعمل قوس زيادة بالظهر",
            "اضغط لفوق مش لقدام",
            "نزل لمستوى الأذن",
            "شد عضلات البطن",
        ],
    },
    "lateral_raise": {
        "name": "Lateral Raise",
        "name_ar": "رفرفة جانبية",
        "joints": {
            "left_shoulder": {"min": 10, "max": 100, "ideal_top": 85},
            "right_shoulder": {"min": 10, "max": 100, "ideal_top": 85},
        },
        "rep_joint": "left_shoulder",
        "rep_threshold_down": 25,
        "rep_threshold_up": 70,
        "tips": [
            "Lead with elbows, not hands",
            "Don't go above shoulder height",
            "Slight bend in elbows",
            "Control the movement, don't swing",
        ],
        "tips_ar": [
            "ارفع بالكوع مش باليد",
            "لا ترفع فوق مستوى الكتف",
            "ثني خفيف في المرفق",
            "تحكم في الحركة، لا تتأرجح",
        ],
    },
    "deadlift": {
        "name": "Deadlift",
        "name_ar": "ديدلفت",
        "joints": {
            "left_hip": {"min": 50, "max": 175, "ideal_bottom": 70},
            "right_hip": {"min": 50, "max": 175, "ideal_bottom": 70},
            "left_knee": {"min": 100, "max": 175, "ideal_bottom": 120},
            "right_knee": {"min": 100, "max": 175, "ideal_bottom": 120},
        },
        "rep_joint": "left_hip",
        "rep_threshold_down": 100,
        "rep_threshold_up": 160,
        "tips": [
            "Keep the bar close to your body",
            "Back straight throughout the lift",
            "Drive through your heels",
            "Hinge at the hips, not the back",
        ],
        "tips_ar": [
            "حافظ على البار قريب من جسمك",
            "الظهر مستقيم طوال الرفع",
            "ادفع من الكعب",
            "الحركة من الورك مش الظهر",
        ],
    },
    "lunge": {
        "name": "Lunge",
        "name_ar": "لانج",
        "joints": {
            "left_knee": {"min": 70, "max": 175, "ideal_bottom": 90},
            "right_knee": {"min": 70, "max": 175, "ideal_bottom": 90},
        },
        "rep_joint": "left_knee",
        "rep_threshold_down": 110,
        "rep_threshold_up": 160,
        "tips": [
            "Front knee stays behind toes",
            "Back knee almost touches floor",
            "Keep torso upright",
            "Step forward far enough",
        ],
        "tips_ar": [
            "الركبة الأمامية لا تتعدى أصابع القدم",
            "الركبة الخلفية تقترب من الأرض",
            "حافظ على استقامة الجذع",
            "اخطو للأمام بما يكفي",
        ],
    },
}


# ── Endpoints ──────────────────────────────────────────

@router.get("/exercises")
async def get_pose_exercises():
    """Return available exercises with their angle rules for client-side pose tracking."""
    return EXERCISE_RULES


@router.get("/exercises/{exercise_id}")
async def get_exercise_rules(exercise_id: str):
    """Return angle rules for a specific exercise."""
    if exercise_id not in EXERCISE_RULES:
        return {"error": "Exercise not found", "available": list(EXERCISE_RULES.keys())}
    return EXERCISE_RULES[exercise_id]


@router.post("/session")
async def save_pose_session(data: PoseSessionResult, user: dict = Depends(get_current_user)):
    """Save a completed pose tracking session with rep count and form score."""
    db = get_db()
    doc = data.model_dump()
    doc["user_id"] = user["id"]
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.pose_sessions.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Pose session saved"}


@router.get("/history")
async def get_pose_history(user: dict = Depends(get_current_user)):
    """Get user's pose tracking session history."""
    db = get_db()
    cursor = db.pose_sessions.find(
        {"user_id": user["id"]},
        sort=[("created_at", -1)],
        limit=30,
    )
    sessions = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        sessions.append(doc)
    return sessions
