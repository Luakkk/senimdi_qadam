from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..rag import rag_answer, ingest_document
from ..auth import require_any_user, require_admin
from ..limiter import limiter

router = APIRouter(prefix="/rag", tags=["RAG / AI Ассистент"])

class QuestionRequest(BaseModel):
    question: str
    language: str = "ru"

class IngestRequest(BaseModel):
    content: str
    source: str
    category: str
    language: str = "ru"

@router.post("/answer")
@limiter.limit("30/minute")
def answer_question(
    request: Request,
    body: QuestionRequest,
    db: Session = Depends(get_db),
    _user: dict = Depends(require_any_user),
):
    """Задать вопрос AI-ассистенту (RAG pipeline). Требует авторизации. Лимит: 30 req/min."""
    try:
        result = rag_answer(body.question, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
@limiter.limit("10/minute")
def ingest(
    request: Request,
    body: IngestRequest,
    db: Session = Depends(get_db),
    _admin: dict = Depends(require_admin),
):
    """Загрузить документ в базу знаний. Требует роль ADMIN или MODERATOR. Лимит: 10 req/min."""
    try:
        result = ingest_document(
            content=body.content,
            source=body.source,
            category=body.category,
            db=db,
            language=body.language,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
