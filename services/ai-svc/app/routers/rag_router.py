from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..rag import rag_answer, ingest_document

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
def answer_question(body: QuestionRequest, db: Session = Depends(get_db)):
    """Задать вопрос AI-ассистенту (RAG pipeline)"""
    try:
        result = rag_answer(body.question, db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
def ingest(body: IngestRequest, db: Session = Depends(get_db)):
    """Загрузить документ в базу знаний (для администраторов)"""
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
