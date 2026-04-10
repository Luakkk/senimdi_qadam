"""
sessions_router.py — история AI-чата

POST   /chat/sessions                   — создать новую сессию
GET    /chat/sessions                   — мои сессии (список)
GET    /chat/sessions/{id}              — одна сессия с сообщениями
POST   /chat/sessions/{id}/message     — отправить сообщение (история → GPT → сохранить)
DELETE /chat/sessions/{id}             — удалить сессию
PATCH  /chat/sessions/{id}/title       — переименовать сессию
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
import uuid

from ..database import get_db
from ..models import ChatSession, ChatMessage
from ..chat import simple_chat, rag_chat
from ..auth import get_current_user_id

router = APIRouter(prefix="/chat/sessions", tags=["Chat — История сессий"])


# ── Pydantic схемы ────────────────────────────────────────────────────────────

class CreateSessionRequest(BaseModel):
    mode: str = Field(
        default="chat",
        description="Режим чата: 'chat' (обычный) или 'rag' (поиск организаций)",
        example="chat",
    )
    title: Optional[str] = Field(default=None, example="Вопрос про реабилитацию")


class SendMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, example="Где пройти реабилитацию в Алматы?")
    location: Optional[dict] = Field(
        default=None,
        example={"lat": 43.238, "lon": 76.945, "city": "Алматы"},
        description="Геолокация пользователя для поиска 'рядом со мной'",
    )


class UpdateTitleRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: str
    title: Optional[str]
    mode: str
    created_at: str
    updated_at: str
    messages_count: int = 0

    class Config:
        from_attributes = True


# ── Вспомогательные функции ───────────────────────────────────────────────────

def _session_to_dict(session: ChatSession, include_messages=False) -> dict:
    data = {
        "id":             str(session.id),
        "title":          session.title,
        "mode":           session.mode,
        "created_at":     session.created_at.isoformat(),
        "updated_at":     session.updated_at.isoformat() if session.updated_at else session.created_at.isoformat(),
        "messages_count": len(session.messages),
    }
    if include_messages:
        data["messages"] = [_message_to_dict(m) for m in session.messages]
    return data


def _message_to_dict(msg: ChatMessage) -> dict:
    return {
        "id":         str(msg.id),
        "role":       msg.role,
        "content":    msg.content,
        "created_at": msg.created_at.isoformat(),
    }


def _load_history(session: ChatSession, limit: int = 20) -> list[dict]:
    """Загружаем последние N сообщений для контекста GPT."""
    msgs = session.messages[-limit:]
    return [{"role": m.role, "content": m.content} for m in msgs]


def _auto_title(text: str, max_len: int = 60) -> str:
    """Первые слова сообщения как заголовок сессии."""
    t = text.strip().replace("\n", " ")
    return t[:max_len] + ("..." if len(t) > max_len else "")


# ── Эндпоинты ─────────────────────────────────────────────────────────────────

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Создать новую сессию чата",
)
def create_session(
    body: CreateSessionRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Создаёт пустую сессию. Используй потом POST /{id}/message для отправки сообщений.
    mode: 'chat' — обычный чат, 'rag' — поиск организаций.
    """
    session = ChatSession(
        user_id=user_id,
        mode=body.mode,
        title=body.title,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _session_to_dict(session)


@router.get(
    "",
    summary="Мои сессии чата (список)",
)
def list_sessions(
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Возвращает список сессий текущего пользователя, отсортированных по дате обновления.
    """
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .order_by(desc(ChatSession.updated_at))
        .offset(offset)
        .limit(limit)
        .all()
    )
    total = db.query(ChatSession).filter(ChatSession.user_id == user_id).count()
    return {
        "sessions": [_session_to_dict(s) for s in sessions],
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.get(
    "/{session_id}",
    summary="Сессия с историей сообщений",
)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """Возвращает сессию со всеми сообщениями."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    return _session_to_dict(session, include_messages=True)


@router.post(
    "/{session_id}/message",
    summary="Отправить сообщение (с историей контекстом)",
)
def send_message(
    session_id: str,
    body: SendMessageRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Основной эндпоинт. Алгоритм:
    1. Загружаем последние 20 сообщений сессии → контекст для GPT
    2. Добавляем новое сообщение пользователя
    3. Вызываем GPT (simple_chat или rag_chat зависит от mode сессии)
    4. Сохраняем оба сообщения (user + assistant) в БД
    5. Обновляем заголовок сессии (если ещё не задан)
    6. Возвращаем ответ ассистента
    """
    # 1. Загружаем сессию
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    # 2. Загружаем историю (последние 20 сообщений = контекст GPT)
    history = _load_history(session, limit=20)

    # 3. Добавляем текущий вопрос
    history.append({"role": "user", "content": body.message})

    # 4. Парсим геолокацию если передана
    location = None
    if body.location:
        class _Loc:
            lat = body.location.get("lat")
            lon = body.location.get("lon")
            city = body.location.get("city", "Алматы")
        location = _Loc()

    # 5. Вызываем GPT в зависимости от режима сессии
    try:
        if session.mode == "rag":
            result = rag_chat(history, location=location)
            answer = result["answer"]
            extra = {
                "organizations_found": result.get("organizations_found", 0),
                "organizations":       result.get("organizations", []),
            }
        else:
            answer = simple_chat(history, location=location)
            extra = {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка AI: {str(e)}")

    # 6. Сохраняем сообщение пользователя
    user_msg = ChatMessage(session_id=session.id, role="user", content=body.message)
    db.add(user_msg)

    # 7. Сохраняем ответ ассистента
    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=answer)
    db.add(assistant_msg)

    # 8. Заголовок сессии = первый вопрос пользователя
    if not session.title:
        session.title = _auto_title(body.message)

    db.commit()
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    return {
        "session_id":  str(session.id),
        "user_message": _message_to_dict(user_msg),
        "answer":       _message_to_dict(assistant_msg),
        **extra,
    }


@router.patch(
    "/{session_id}/title",
    summary="Переименовать сессию",
)
def update_title(
    session_id: str,
    body: UpdateTitleRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    session.title = body.title
    db.commit()
    return {"id": str(session.id), "title": session.title}


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить сессию (со всеми сообщениями)",
)
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    db.delete(session)
    db.commit()
