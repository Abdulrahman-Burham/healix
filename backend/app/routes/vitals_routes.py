from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from datetime import datetime, timezone, timedelta
from app.models import VitalSigns, VitalsUpload
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/vitals", tags=["Vital Signs"])


@router.post("/upload")
async def upload_vitals(data: VitalsUpload, user: dict = Depends(get_current_user)):
    db = get_db()
    docs = []
    for v in data.data:
        doc = v.model_dump(exclude_none=True)
        doc["user_id"] = user["id"]
        doc["timestamp"] = doc.get("timestamp", datetime.now(timezone.utc))
        docs.append(doc)
    if docs:
        await db.vitals.insert_many(docs)
    return {"message": f"Uploaded {len(docs)} vital records"}


@router.get("/current")
async def get_current_vitals(user: dict = Depends(get_current_user)):
    db = get_db()
    latest = await db.vitals.find_one(
        {"user_id": user["id"]},
        sort=[("timestamp", -1)]
    )
    if not latest:
        return {
            "heart_rate": 72, "spo2": 98, "stress_level": 3,
            "steps": 6500, "calories_burned": 420,
            "blood_pressure_sys": 118, "blood_pressure_dia": 75,
            "hrv": 45, "body_temp": 36.6,
            "sleep_hours": 7.0, "sleep_quality": 78,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    latest["_id"] = str(latest["_id"])
    return latest


@router.get("/history")
async def get_vitals_history(
    period: str = Query("24h", regex="^(24h|7d|30d)$"),
    user: dict = Depends(get_current_user),
):
    db = get_db()
    now = datetime.now(timezone.utc)
    delta = {"24h": timedelta(hours=24), "7d": timedelta(days=7), "30d": timedelta(days=30)}
    start = now - delta.get(period, timedelta(hours=24))

    cursor = db.vitals.find(
        {"user_id": user["id"], "timestamp": {"$gte": start}},
        sort=[("timestamp", 1)]
    )
    records = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    return records


@router.get("/weekly-trends")
async def get_weekly_trends(user: dict = Depends(get_current_user)):
    """Get weekly vital trends for dashboard / monitoring."""
    db = get_db()
    start = datetime.now(timezone.utc) - timedelta(days=7)
    cursor = db.vitals.find(
        {"user_id": user["id"], "timestamp": {"$gte": start}},
        sort=[("timestamp", 1)],
    )
    records = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    if not records:
        # Return sample weekly data so dashboard is not empty
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        records = [
            {"day": d, "heartRate": 72 + i * 2, "steps": 5000 + i * 800,
             "calories": 350 + i * 50, "sleep": 6.5 + (i % 3) * 0.5}
            for i, d in enumerate(days)
        ]
    return records


@router.get("/alerts")
async def get_alerts(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.alerts.find(
        {"user_id": user["id"]},
        sort=[("created_at", -1)],
        limit=20,
    )
    alerts = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        alerts.append(doc)
    return alerts
