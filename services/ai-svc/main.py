from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.chat_router   import router as chat_router
from app.routers.rag_router    import router as rag_router
from app.routers.speech_router import router as speech_router

app = FastAPI(
    title="SenimdiQAdam — AI Service",
    description="AI-ассистент Сенім для людей с инвалидностью в Алматы, Казахстан",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "*",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ── Роутеры ────────────────────────────────────────────────────────────────────
app.include_router(chat_router)    # /chat/*  — обычный чат, RAG, экстренный
app.include_router(rag_router)     # /rag/*   — RAG ответы, загрузка документов
app.include_router(speech_router)  # /speech/* — STT (аудио→текст), TTS (текст→аудио)


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "ok",
        "service": "ai-svc",
        "assistant": "Сенім (Senim)",
        "routers": ["chat", "rag", "speech"],
    }
