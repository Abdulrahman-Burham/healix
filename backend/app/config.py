import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://192.168.101.73:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "healix")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "healix-secret-key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRATION_MINUTES: int = int(os.getenv("JWT_EXPIRATION_MINUTES", "1440"))
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://176.65.148.253:8554")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "qwen3-embedding:8b")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "glm-4.7-flash:q4_K_M")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")


settings = Settings()
