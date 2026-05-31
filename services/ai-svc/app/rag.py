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

def _split_into_chunks(content: str, max_chars: int = 600, overlap_chars: int = 80) -> list[str]:
    """
    Paragraph-aware chunker.

    Strategy:
      1. Split by blank lines (paragraph boundaries) — keeps sentences intact.
      2. If a paragraph exceeds max_chars, sub-split on sentence boundaries (. ! ?).
      3. Accumulate paragraphs into a chunk until max_chars is reached, then start
         a new chunk with the last paragraph repeated as overlap context.

    This avoids cutting mid-sentence which degrades embedding quality.
    """
    import re

    # Step 1: Split into natural paragraphs (2+ newlines or section breaks)
    raw_paragraphs = re.split(r'\n{2,}', content.strip())

    sentences: list[str] = []
    for para in raw_paragraphs:
        para = para.strip()
        if not para:
            continue
        if len(para) <= max_chars:
            sentences.append(para)
        else:
            # Sub-split long paragraphs on sentence endings
            parts = re.split(r'(?<=[.!?])\s+', para)
            sentences.extend(p.strip() for p in parts if p.strip())

    # Step 2: Accumulate sentences into chunks with overlap
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sent in sentences:
        sent_len = len(sent)
        if current_len + sent_len > max_chars and current:
            chunks.append(' '.join(current))
            # Overlap: keep the last sentence(s) up to overlap_chars
            overlap_buf: list[str] = []
            overlap_len = 0
            for s in reversed(current):
                if overlap_len + len(s) > overlap_chars:
                    break
                overlap_buf.insert(0, s)
                overlap_len += len(s)
            current = overlap_buf
            current_len = overlap_len
        current.append(sent)
        current_len += sent_len

    if current:
        chunks.append(' '.join(current))

    return [c for c in chunks if c.strip()]


def ingest_document(content: str, source: str, category: str, db: Session, language: str = "ru"):
    """Добавить документ в базу знаний (с векторизацией)"""
    # Paragraph-aware splitting — сохраняет границы предложений
    chunks = _split_into_chunks(content)

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
