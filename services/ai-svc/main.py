from contextlib import asynccontextmanager
import os

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

_SENTRY_DSN = os.getenv("SENTRY_DSN")
if _SENTRY_DSN:
    sentry_sdk.init(
        dsn=_SENTRY_DSN,
        environment=os.getenv("ENV", "development"),
        traces_sample_rate=0.2,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from prometheus_fastapi_instrumentator import Instrumentator
from app.database import init_db
from app.limiter import limiter
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
    # Rate limiting: slowapi
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

# ── Rate limiting ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

import os

# Разрешённые источники: фронтенд + gateway.
# allow_origins=["*"] + allow_credentials=True — невалидно по CORS-спеке и небезопасно.
_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    allow_credentials=True,
)

# ── Роутеры ────────────────────────────────────────────────────────────────────
app.include_router(sessions_router)  # /chat/sessions/* — история чата (JWT)
app.include_router(chat_router)      # /chat/*          — разовый чат без сессии
app.include_router(rag_router)       # /rag/*           — RAG + загрузка документов
app.include_router(speech_router)    # /speech/*        — STT + TTS

# ── Prometheus metrics exposed at /metrics ────────────────────────────────────
Instrumentator().instrument(app).expose(app)


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "ai-svc",
        "version": "2.1.0",
        "assistant": "Сенім (Senim)",
        "features": ["chat", "chat-history", "rag", "stt", "tts", "geolocation"],
    }
