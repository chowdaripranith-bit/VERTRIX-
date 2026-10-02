import os
from dotenv import load_dotenv

# Load from .env if present
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

# Determine database path that works both locally and in Docker containers
_default_db_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_default_db_path = f"sqlite:///{os.path.join(_default_db_dir, 'agri_optimizer.db')}"

class Settings:
    PROJECT_NAME: str = "AI-Based Crop and Agricultural Resource Optimization System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", _default_db_path)
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.onrender.com",
        "*"
    ]
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("LLM_API_KEY", ""))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-1.5-flash")
    GOOGLE_SPEECH_API_KEY: str = os.getenv("GOOGLE_SPEECH_API_KEY", "")
    DATA_GOV_API_KEY: str = os.getenv("DATA_GOV_API_KEY", "")

settings = Settings()

