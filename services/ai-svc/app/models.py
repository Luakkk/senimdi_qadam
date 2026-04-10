from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
import uuid
from .database import Base


# ── RAG: документы для векторного поиска ─────────────────────────────────────

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source     = Column(String(255))        # название организации / документа
    content    = Column(Text, nullable=False)
    embedding  = Column(Vector(1536))       # text-embedding-3-small = 1536 dims
    category   = Column(String(100))        # rehabilitation, medical, legal...
    language   = Column(String(10), default="ru")
    created_at = Column(DateTime, server_default=func.now())


# ── Chat: сессии и история сообщений ─────────────────────────────────────────

class ChatSession(Base):
    """
    Сессия чата — одна беседа пользователя с Сенімом.
    userId берётся из JWT payload (sub) — это id из core-svc.
    """
    __tablename__ = "chat_sessions"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(String(255), nullable=False, index=True)  # sub из JWT
    title      = Column(String(255), nullable=True)               # первое сообщение → заголовок
    mode       = Column(String(50), default="chat")               # "chat" | "rag" | "emergency"
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    messages   = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class ChatMessage(Base):
    """
    Одно сообщение внутри сессии.
    role: "user" | "assistant"
    """
    __tablename__ = "chat_messages"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role       = Column(String(20), nullable=False)   # "user" | "assistant"
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    session    = relationship("ChatSession", back_populates="messages")
