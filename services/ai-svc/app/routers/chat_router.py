from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from ..chat import simple_chat, rag_chat, emergency_chat, SITE_GUIDE
from ..auth import require_any_user
from ..limiter import limiter

router = APIRouter(prefix="/chat", tags=["Chat / AI Ассистент"])


# ── Схемы запросов ────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str      # "user" или "assistant"
    content: str

class UserLocation(BaseModel):
    lat: float
    lon: float
    city: Optional[str] = "Алматы"

class ChatRequest(BaseModel):
    messages: list[Message]
    location: Optional[UserLocation] = None  # геолокация пользователя (опционально)
    """
    Пример с геолокацией:
    {
      "messages": [{"role": "user", "content": "Где пройти реабилитацию рядом со мной?"}],
      "location": {"lat": 43.238, "lon": 76.945, "city": "Алматы"}
    }
    """

class EmergencyRequest(BaseModel):
    message: str
    location: Optional[UserLocation] = None
    """
    Пример: {"message": "человек потерял сознание", "location": {"lat": 43.238, "lon": 76.945}}
    """


# ── Эндпоинты ─────────────────────────────────────────────────────────────────

@router.post("/")
@limiter.limit("20/minute")
def chat(request: Request, body: ChatRequest, _user: dict = Depends(require_any_user)):
    """
    Обычный чат как ChatGPT. Требует авторизации. Лимит: 20 req/min.
    Передавай всю историю сообщений — бот помнит контекст разговора.
    Опционально передай location чтобы AI знал где ты находишься.
    """
    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]
        answer = simple_chat(messages, location=body.location)
        return {"answer": answer, "type": "chat"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rag")
@limiter.limit("20/minute")
def chat_with_orgs(request: Request, body: ChatRequest, _user: dict = Depends(require_any_user)):
    """
    Чат + поиск организаций из базы данных. Требует авторизации. Лимит: 20 req/min.
    Если передать location — AI покажет организации рядом с пользователем
    и скажет расстояние до каждой.
    """
    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]
        result = rag_chat(messages, location=body.location)
        return {**result, "type": "rag"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/emergency")
@limiter.limit("10/minute")
def emergency(request: Request, body: EmergencyRequest, _user: dict = Depends(require_any_user)):
    """
    Экстренная помощь — короткие чёткие инструкции + номера телефонов.
    Требует авторизации. Лимит: 10 req/min.
    """
    try:
        answer = emergency_chat(body.message)
        return {
            "answer": answer,
            "type": "emergency",
            "emergency_numbers": {
                "единый": "112",
                "скорая": "103",
                "полиция": "102",
                "пожарная": "101",
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/guide")
def guide():
    """
    Гид по платформе SenimdiQAdam — что где найти и как пользоваться.
    """
    return {"guide": SITE_GUIDE, "type": "guide"}
