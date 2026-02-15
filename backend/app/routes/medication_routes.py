from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timezone
from app.models import MedicationCreate, MedicationUpdate
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/medications", tags=["Medications"])


@router.get("/")
async def get_medications(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.medications.find({"user_id": user["id"]})
    meds = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        meds.append(doc)
    return meds


@router.post("/")
async def add_medication(data: MedicationCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = data.model_dump()
    doc["user_id"] = user["id"]
    doc["status"] = "upcoming"
    doc["created_at"] = datetime.now(timezone.utc)
    result = await db.medications.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Medication added"}


@router.get("/today")
async def get_today_medications(user: dict = Depends(get_current_user)):
    """Get today's medications."""
    return await get_medications(user)


@router.put("/{med_id}")
async def update_medication_status(med_id: str, data: MedicationUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    update = {"status": data.status}
    if data.taken_at:
        update["taken_at"] = data.taken_at
    elif data.status == "taken":
        update["taken_at"] = datetime.now(timezone.utc)
    await db.medications.update_one(
        {"_id": ObjectId(med_id), "user_id": user["id"]},
        {"$set": update},
    )
    return {"message": "Medication updated"}


@router.delete("/{med_id}")
async def delete_medication(med_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    await db.medications.delete_one({"_id": ObjectId(med_id), "user_id": user["id"]})
    return {"message": "Medication deleted"}


@router.get("/compliance")
async def get_compliance(user: dict = Depends(get_current_user)):
    db = get_db()
    total = await db.medications.count_documents({"user_id": user["id"]})
    taken = await db.medications.count_documents({"user_id": user["id"], "status": "taken"})
    compliance = (taken / total * 100) if total > 0 else 100
    return {"total": total, "taken": taken, "compliance": round(compliance, 1)}


@router.get("/family-code")
async def get_family_code(user: dict = Depends(get_current_user)):
    db = get_db()
    u = await db.users.find_one({"_id": ObjectId(user["id"])})
    code = u.get("family_code")
    if not code:
        import random, string
        code = "HLX-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": {"family_code": code}})
    return {"code": code}
