"""Тесты sessions_router — чистые хелперы (заголовок, история) без БД."""
from types import SimpleNamespace
import app.routers.sessions_router as sr


def test_auto_title_short():
    assert sr._auto_title("Привет") == "Привет"


def test_auto_title_truncates_long_text():
    long = "а" * 100
    title = sr._auto_title(long, max_len=60)
    assert title.endswith("...")
    assert len(title) == 63  # 60 символов + "..."


def test_auto_title_collapses_newlines():
    assert sr._auto_title("строка\nвторая") == "строка вторая"


def test_load_history_maps_role_content():
    session = SimpleNamespace(messages=[
        SimpleNamespace(role="user", content="вопрос"),
        SimpleNamespace(role="assistant", content="ответ"),
    ])
    hist = sr._load_history(session)
    assert hist == [
        {"role": "user", "content": "вопрос"},
        {"role": "assistant", "content": "ответ"},
    ]


def test_load_history_keeps_only_last_n():
    msgs = [SimpleNamespace(role="user", content=str(i)) for i in range(50)]
    session = SimpleNamespace(messages=msgs)
    hist = sr._load_history(session, limit=20)
    assert len(hist) == 20
    assert hist[-1]["content"] == "49"
