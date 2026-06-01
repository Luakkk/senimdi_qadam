"""
Функциональные endpoint-тесты ai-svc через FastAPI TestClient.

Покрывают HTTP-слой роутеров (auth-гейтинг, валидацию тел, форму ответов),
а внешние зависимости замоканы:
  • AI-функции (simple_chat / rag_chat / emergency_chat) — monkeypatch;
  • RAG (rag_answer / ingest_document) — monkeypatch;
  • speech (transcribe_audio / synthesize_text) — monkeypatch;
  • БД (get_db) — in-memory SQLite (только для sessions CRUD);
  • init_db в lifespan — no-op (не коннектимся к настоящей ai_db).
JWT настоящий: секрет из conftest (test-secret-key).
"""
import io
import jwt
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

import app.database as database
# Подменяем init_db ДО импорта main (lifespan вызовет no-op вместо коннекта к Postgres)
database.init_db = lambda *a, **k: None

# Отключаем rate limiter ДО импорта main: иначе slowapi полезет в Redis (host=redis)
import app.limiter as _limiter_mod
_limiter_mod.limiter.enabled = False

import main  # noqa: E402
from app.database import get_db, Base  # noqa: E402
from app.models import ChatSession, ChatMessage  # noqa: E402  (нужно для create_all)
from app.auth import JWT_SECRET  # noqa: E402

# main.app тоже держит ссылку на limiter в state — глушим и его на всякий случай
main.app.state.limiter.enabled = False

fastapi_app = main.app


# ── SQLite-совместимый UUID ──────────────────────────────────────────────────
# В моделях id/session_id — postgresql UUID(as_uuid=True). На SQLite его
# bind-процессор падает ('str' object has no attribute 'hex'). Подменяем тип
# колонок на CHAR(36)-обёртку только для тестового движка.
from sqlalchemy.types import TypeDecorator, CHAR  # noqa: E402


class _SqliteUUID(TypeDecorator):
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        return None if value is None else str(value)

    def process_result_value(self, value, dialect):
        return value


for _col in (
    ChatSession.__table__.c.id,
    ChatMessage.__table__.c.id,
    ChatMessage.__table__.c.session_id,
):
    _col.type = _SqliteUUID()


# ── SQLite in-memory для sessions CRUD ───────────────────────────────────────
_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    # Отключаем insertmanyvalues: на нашем CHAR(36)-UUID его sentinel-сверка
    # (Python-UUID из default vs str из RETURNING) не сходится и падает.
    use_insertmanyvalues=False,
)
_TestingSession = sessionmaker(bind=_engine, autocommit=False, autoflush=False)
# Создаём только chat-таблицы (DocumentChunk с Vector нам в sessions не нужен)
ChatSession.__table__.create(bind=_engine, checkfirst=True)
ChatMessage.__table__.create(bind=_engine, checkfirst=True)


def _override_get_db():
    db = _TestingSession()
    try:
        yield db
    finally:
        db.close()


fastapi_app.dependency_overrides[get_db] = _override_get_db


def token(sub="user-1", role="USER"):
    return jwt.encode({"sub": sub, "role": role}, JWT_SECRET, algorithm="HS256")


def auth(sub="user-1", role="USER"):
    return {"Authorization": f"Bearer {token(sub, role)}"}


@pytest.fixture
def client():
    return TestClient(fastapi_app)


# ── HEALTH / публичные ───────────────────────────────────────────────────────
def test_health_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_chat_guide_public(client):
    r = client.get("/chat/guide")
    assert r.status_code == 200
    assert "guide" in r.json()


def test_speech_voices_public(client):
    r = client.get("/speech/voices")
    assert r.status_code == 200
    assert "voices" in r.json()


# ── AUTH-ГЕЙТИНГ ─────────────────────────────────────────────────────────────
def test_chat_requires_auth(client):
    r = client.post("/chat/", json={"messages": [{"role": "user", "content": "привет"}]})
    assert r.status_code == 401


def test_rag_ingest_requires_admin(client, monkeypatch):
    monkeypatch.setattr("app.routers.rag_router.ingest_document", lambda **k: {"ok": True})
    # обычный USER → 403
    r = client.post(
        "/rag/ingest",
        headers=auth(role="USER"),
        json={"content": "x", "source": "s", "category": "medical"},
    )
    assert r.status_code == 403


# ── CHAT ─────────────────────────────────────────────────────────────────────
def test_chat_simple(client, monkeypatch):
    monkeypatch.setattr("app.routers.chat_router.simple_chat", lambda msgs, location=None: "ответ бота")
    r = client.post(
        "/chat/",
        headers=auth(),
        json={"messages": [{"role": "user", "content": "привет"}]},
    )
    assert r.status_code == 200
    body = r.json()
    assert body == {"answer": "ответ бота", "type": "chat"}


def test_chat_rag(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.chat_router.rag_chat",
        lambda msgs, location=None: {"answer": "нашёл", "organizations_found": 2, "organizations": []},
    )
    r = client.post(
        "/chat/rag",
        headers=auth(),
        json={"messages": [{"role": "user", "content": "реабилитация рядом"}],
              "location": {"lat": 43.2, "lon": 76.9}},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["type"] == "rag"
    assert body["organizations_found"] == 2


def test_chat_emergency(client, monkeypatch):
    monkeypatch.setattr("app.routers.chat_router.emergency_chat", lambda msg: "звоните 103")
    r = client.post("/chat/emergency", headers=auth(), json={"message": "потерял сознание"})
    assert r.status_code == 200
    body = r.json()
    assert body["type"] == "emergency"
    assert body["emergency_numbers"]["скорая"] == "103"


def test_chat_validation_error(client):
    # пустое тело → 422 (messages обязательно)
    r = client.post("/chat/", headers=auth(), json={})
    assert r.status_code == 422


# ── RAG ──────────────────────────────────────────────────────────────────────
def test_rag_answer(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.rag_router.rag_answer",
        lambda q, db: {"answer": "из базы знаний", "sources": ["org1"]},
    )
    r = client.post("/rag/answer", headers=auth(), json={"question": "где помощь?"})
    assert r.status_code == 200
    assert r.json()["answer"] == "из базы знаний"


def test_rag_ingest_admin_ok(client, monkeypatch):
    monkeypatch.setattr(
        "app.routers.rag_router.ingest_document",
        lambda **k: {"chunks": 3, "source": k["source"]},
    )
    r = client.post(
        "/rag/ingest",
        headers=auth(role="ADMIN"),
        json={"content": "длинный текст", "source": "Гид", "category": "legal"},
    )
    assert r.status_code == 200
    assert r.json()["chunks"] == 3


# ── SPEECH ───────────────────────────────────────────────────────────────────
def test_speech_synthesize(client, monkeypatch):
    async def fake_tts(text, language="ru-RU"):
        return b"ID3FAKEMP3"
    monkeypatch.setattr("app.routers.speech_router.synthesize_text", fake_tts)
    r = client.post("/speech/synthesize", headers=auth(), json={"text": "привет"})
    assert r.status_code == 200
    assert r.headers["content-type"] == "audio/mpeg"
    assert r.content == b"ID3FAKEMP3"


def test_speech_transcribe(client, monkeypatch):
    monkeypatch.setattr("app.routers.speech_router.transcribe_audio", lambda b, language="ru-RU": "распознанный текст")
    r = client.post(
        "/speech/transcribe",
        headers=auth(),
        files={"file": ("a.wav", io.BytesIO(b"RIFFfakeaudio"), "audio/wav")},
    )
    assert r.status_code == 200
    assert r.json()["text"] == "распознанный текст"


def test_speech_transcribe_empty_file(client):
    r = client.post(
        "/speech/transcribe",
        headers=auth(),
        files={"file": ("a.wav", io.BytesIO(b""), "audio/wav")},
    )
    assert r.status_code == 400


# ── SESSIONS CRUD (через SQLite) ─────────────────────────────────────────────
def test_sessions_full_flow(client, monkeypatch):
    monkeypatch.setattr("app.routers.sessions_router.simple_chat", lambda hist, location=None: "ответ ассистента")

    # создать
    r = client.post("/chat/sessions", headers=auth(sub="sess-user"), json={"mode": "chat"})
    assert r.status_code == 201
    sid = r.json()["id"]

    # список
    r = client.get("/chat/sessions", headers=auth(sub="sess-user"))
    assert r.status_code == 200
    assert any(s["id"] == sid for s in r.json()["sessions"])

    # отправить сообщение → ответ ассистента + заголовок
    r = client.post(
        f"/chat/sessions/{sid}/message",
        headers=auth(sub="sess-user"),
        json={"message": "Где пройти реабилитацию?"},
    )
    assert r.status_code == 200
    assert r.json()["answer"]["content"] == "ответ ассистента"

    # сессия с историей: 2 сообщения, авто-заголовок проставлен
    r = client.get(f"/chat/sessions/{sid}", headers=auth(sub="sess-user"))
    assert r.status_code == 200
    body = r.json()
    assert body["messages_count"] == 2
    assert body["title"]

    # чужой пользователь не видит сессию → 404
    r = client.get(f"/chat/sessions/{sid}", headers=auth(sub="other-user"))
    assert r.status_code == 404

    # переименовать
    r = client.patch(f"/chat/sessions/{sid}/title", headers=auth(sub="sess-user"), json={"title": "Новый"})
    assert r.status_code == 200
    assert r.json()["title"] == "Новый"

    # удалить → 204
    r = client.delete(f"/chat/sessions/{sid}", headers=auth(sub="sess-user"))
    assert r.status_code == 204

    # после удаления → 404
    r = client.get(f"/chat/sessions/{sid}", headers=auth(sub="sess-user"))
    assert r.status_code == 404
