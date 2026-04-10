from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers.chat_router     import router as chat_router
from app.routers.rag_router      import router as rag_router
from app.routers.speech_router   import router as speech_router
from app.routers.sessions_router import router as sessions_router


# ── Lifespan: создаём таблицы при старте ──────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Инициализируем БД при старте (pgvector + все таблицы)."""
    init_db()
    yield


# ── Приложение ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="SenimdiQAdam — AI Service",
    description="""
AI-ассистент **Сенім** для людей с инвалидностью в Алматы, Казахстан.

### Возможности:
- 💬 **Chat** — обычный чат с историей сессий
- 🔍 **RAG** — поиск организаций из базы данных + GPT ответы
- 🎤 **STT** — аудио → текст (faster-whisper, бесплатно)
- 🔊 **TTS** — текст → MP3 (edge-tts, бесплатно)
- 📍 **Геолокация** — "организации рядом со мной"
    """,
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ── Роутеры ────────────────────────────────────────────────────────────────────
app.include_router(sessions_router)  # /chat/sessions/* — история чата (JWT)
app.include_router(chat_router)      # /chat/*          — разовый чат без сессии
app.include_router(rag_router)       # /rag/*           — RAG + загрузка документов
app.include_router(speech_router)    # /speech/*        — STT + TTS


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "ai-svc",
        "version": "2.1.0",
        "assistant": "Сенім (Senim)",
        "features": ["chat", "chat-history", "rag", "stt", "tts", "geolocation"],
    }
