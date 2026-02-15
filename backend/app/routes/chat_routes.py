from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timezone
from app.models import ChatMessage, ChatResponse
from app.auth import get_current_user
from app.database import get_db
from app.ai.agent_system import process_chat_message

router = APIRouter(prefix="/chat", tags=["AI Chat"])


@router.post("", response_model=ChatResponse)
@router.post("/", response_model=ChatResponse)
async def chat(data: ChatMessage, user: dict = Depends(get_current_user)):
    db = get_db()

    # Save user message
    await db.chat_history.insert_one({
        "user_id": user["id"],
        "role": "user",
        "content": data.message,
        "created_at": datetime.now(timezone.utc),
    })

    # Get recent history for context
    history_cursor = db.chat_history.find(
        {"user_id": user["id"]},
        sort=[("created_at", -1)],
        limit=10,
    )
    history = []
    async for doc in history_cursor:
        history.append({"role": doc["role"], "content": doc["content"]})
    history.reverse()

    # Process with AI agent system
    result = await process_chat_message(
        message=data.message,
        user=user,
        history=history,
        requested_agent=data.agent,
    )

    # Save assistant response
    await db.chat_history.insert_one({
        "user_id": user["id"],
        "role": "assistant",
        "agent": result["agent"],
        "content": result["response"],
        "sources": result.get("sources", []),
        "created_at": datetime.now(timezone.utc),
    })

    return ChatResponse(
        response=result["response"],
        agent=result["agent"],
        sources=result.get("sources", []),
    )


@router.get("/history")
async def get_chat_history(user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.chat_history.find(
        {"user_id": user["id"]},
        sort=[("created_at", -1)],
        limit=50,
    )
    messages = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        messages.append(doc)
    messages.reverse()
    return messages


@router.delete("/history")
async def clear_chat_history(user: dict = Depends(get_current_user)):
    db = get_db()
    await db.chat_history.delete_many({"user_id": user["id"]})
    return {"message": "Chat history cleared"}
