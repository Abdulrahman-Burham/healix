from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.vitals.create_index([("user_id", 1), ("timestamp", -1)])
    await db.exercises.create_index("user_id")
    await db.nutrition.create_index([("user_id", 1), ("date", -1)])
    await db.medications.create_index("user_id")
    await db.chat_history.create_index([("user_id", 1), ("created_at", -1)])
    await db.alerts.create_index([("user_id", 1), ("created_at", -1)])
    print("✅ Connected to MongoDB")


async def close_db():
    global client
    if client:
        client.close()
        print("❌ Disconnected from MongoDB")


def get_db():
    return db
