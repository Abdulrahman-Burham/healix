from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from datetime import datetime, timezone
from app.models import UserRegister, UserLogin, TokenResponse
from app.auth import hash_password, verify_password, create_token
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserRegister):
    db = get_db()
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "role": "user",
        "onboarding_completed": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id, "user")
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "name": data.name, "email": data.email, "role": "user", "onboarding_completed": False},
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_token(user_id, user.get("role", "user"))
    return TokenResponse(
        access_token=token,
        user={
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "user"),
            "onboarding_completed": user.get("onboarding_completed", False),
        },
    )


@router.get("/me")
async def get_me(user: dict = __import__("fastapi").Depends(__import__("app.auth", fromlist=["get_current_user"]).get_current_user)):
    return user
