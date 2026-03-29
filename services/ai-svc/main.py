from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers.rag_router import router as rag_router
from app.routers.speech_router import router as speech_router

app = FastAPI(
    title="SenimdiQAdam — AI Service",
    description="RAG-ассистент и Speech STT/TTS для людей с инвалидностью",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rag_router)
app.include_router(speech_router)

@app.on_event("startup")
async def startup():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-svc"}
