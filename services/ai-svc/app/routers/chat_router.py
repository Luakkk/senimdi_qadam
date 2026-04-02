from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..chat import simple_chat, rag_chat, emergency_chat, SITE_GUIDE

router = APIRouter(prefix="/chat", tags=["Chat / AI Ассистент"])


# ── Схемы запросов ────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str      # "user" или "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]
    """
    Пример:
    {
      "messages": [
        {"role": "user", "content": "Привет!"},
        {"role": "assistant", "content": "Привет! Чем могу помочь?"},
        {"role": "user", "content": "Где можно пройти реабилитацию в Алматы?"}
      ]
    }
    """

class EmergencyRequest(BaseModel):
    message: str
    """
    Пример: {"message": "человек потерял сознание, что делать?"}
    """


# ── Эндпоинты ─────────────────────────────────────────────────────────────────

@router.post("/")
def chat(body: ChatRequest):
    """
    Обычный чат как ChatGPT.
    Передавай всю историю сообщений — бот помнит контекст разговора.
    """
    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]
        answer = simple_chat(messages)
        return {"answer": answer, "type": "chat"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rag")
def chat_with_orgs(body: ChatRequest):
    """
    Чат + поиск организаций из базы данных.
    Используй когда пользователь спрашивает про организации, реабилитацию,
    медицинскую помощь и т.д.
    """
    try:
        messages = [{"role": m.role, "content": m.content} for m in body.messages]
        result = rag_chat(messages)
        return {**result, "type": "rag"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/emergency")
def emergency(body: EmergencyRequest):
    """
    Экстренная помощь — короткие чёткие инструкции + номера телефонов.
    Используй при экстренных ситуациях.
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
