"""Тесты rag.py — чанкинг (чистая функция) и полный RAG-пайплайн с моками."""
from unittest.mock import MagicMock, patch
import app.rag as rag


# ── _split_into_chunks ────────────────────────────────────────────────────────
def test_split_short_text_single_chunk():
    chunks = rag._split_into_chunks("Короткий текст про организацию.")
    assert len(chunks) == 1


def test_split_respects_max_chars():
    para = " ".join(f"Предложение номер {i}." for i in range(100))
    chunks = rag._split_into_chunks(para, max_chars=200)
    assert len(chunks) > 1
    assert all(len(c) <= 400 for c in chunks)  # с учётом overlap, не разрастается бесконтрольно


def test_split_ignores_empty_paragraphs():
    chunks = rag._split_into_chunks("Абзац один.\n\n\n\nАбзац два.")
    assert all(c.strip() for c in chunks)


# ── rag_answer ────────────────────────────────────────────────────────────────
def _row(content, source, category, similarity):
    r = MagicMock()
    r.content, r.source, r.category, r.similarity = content, source, category, similarity
    return r


def test_rag_answer_builds_sources_and_calls_llm():
    db = MagicMock()
    db.execute.return_value.fetchall.return_value = [
        _row("Реацентр работает с 9 до 18", "org:1", "REHABILITATION", 0.91),
    ]

    with patch("app.rag.get_embedding", return_value=[0.1] * 1536), \
         patch("app.rag.get_chat_response", return_value="Центр открыт 9-18") as mock_llm:
        result = rag.rag_answer("когда работает реацентр", db)

    assert result["answer"] == "Центр открыт 9-18"
    assert result["sources"][0]["source"] == "org:1"
    assert result["sources"][0]["similarity"] == 0.91
    mock_llm.assert_called_once()


def test_rag_answer_handles_no_results():
    db = MagicMock()
    db.execute.return_value.fetchall.return_value = []

    with patch("app.rag.get_embedding", return_value=[0.0] * 1536), \
         patch("app.rag.get_chat_response", return_value="нет данных") as mock_llm:
        result = rag.rag_answer("что-то редкое", db)

    assert result["sources"] == []
    # системный промпт должен содержать "отсутствует" в контексте
    system_prompt = mock_llm.call_args[0][0]
    assert "отсутствует" in system_prompt


# ── ingest_document ───────────────────────────────────────────────────────────
def test_ingest_document_vectorizes_and_commits():
    db = MagicMock()
    with patch("app.rag.get_embedding", return_value=[0.2] * 1536):
        result = rag.ingest_document("Текст документа про услуги.", "src", "MEDICAL", db)

    assert result["ingested_chunks"] >= 1
    assert result["source"] == "src"
    db.add.assert_called()
    db.commit.assert_called_once()
