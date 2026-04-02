from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.chat_router import router as chat_router

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
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-svc", "assistant": "Сенім (Senim)"}
