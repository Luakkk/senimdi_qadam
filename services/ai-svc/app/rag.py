from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import DocumentChunk
from .embeddings import get_embedding, get_chat_response

SYSTEM_PROMPT = """Ты — помощник платформы SenimdiQAdam для людей с инвалидностью в Алматы, Казахстан.

Правила:
1. Отвечай ТОЛЬКО на основе предоставленного контекста из базы данных организаций.
2. Если информации нет в контексте — честно скажи: "У меня нет точных данных по этому вопросу, рекомендую обратиться напрямую в организацию."
3. НЕ придумывай телефоны, адреса, часы работы.
4. Отвечай на языке вопроса (русский или казахский).
5. Будь краток, тактичен и дружелюбен.
6. Если пользователь спрашивает о такси — направь к разделу бронирования на платформе.

Контекст из базы данных организаций:
{context}
"""

def rag_answer(question: str, db: Session, top_k: int = 5) -> dict:
    """Полный RAG pipeline: вопрос → embedding → поиск → GPT-4o → ответ"""

    # 1. Получаем вектор вопроса
    query_embedding = get_embedding(question)

    # 2. Ищем похожие чанки через pgvector (cosine similarity)
    embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"

    results = db.execute(
        text("""
            SELECT content, source, category,
                   1 - (embedding <=> :embedding::vector) AS similarity
            FROM document_chunks
            ORDER BY embedding <=> :embedding::vector
            LIMIT :top_k
        """),
        {"embedding": embedding_str, "top_k": top_k}
    ).fetchall()

    # 3. Формируем контекст
    if not results:
        context = "Информация в базе данных отсутствует."
    else:
        context_parts = []
        for row in results:
            context_parts.append(
                f"[{row.source}] (категория: {row.category}, релевантность: {row.similarity:.2f})\n{row.content}"
            )
        context = "\n\n---\n\n".join(context_parts)

    # 4. Получаем ответ от GPT-4o
    prompt = SYSTEM_PROMPT.format(context=context)
    answer = get_chat_response(prompt, question)

    return {
        "answer": answer,
        "sources": [{"source": r.source, "similarity": round(r.similarity, 3)} for r in results],
    }

def ingest_document(content: str, source: str, category: str, db: Session, language: str = "ru"):
    """Добавить документ в базу знаний (с векторизацией)"""
    # Разбиваем на чанки по 500 символов с перекрытием 50
    chunk_size = 500
    overlap = 50
    chunks = []

    for i in range(0, len(content), chunk_size - overlap):
        chunk = content[i:i + chunk_size]
        if chunk.strip():
            chunks.append(chunk)

    for chunk_text in chunks:
        embedding = get_embedding(chunk_text)
        doc = DocumentChunk(
            content=chunk_text,
            source=source,
            category=category,
            language=language,
            embedding=embedding,
        )
        db.add(doc)

    db.commit()
    return {"ingested_chunks": len(chunks), "source": source}
