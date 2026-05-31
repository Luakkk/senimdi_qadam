"""Тесты chat.py — чистая логика (haversine, форматирование, поиск, чат-обёртки)."""
from unittest.mock import MagicMock, patch
import app.chat as chat


# ── _haversine_km ─────────────────────────────────────────────────────────────
def test_haversine_zero_distance():
    assert chat._haversine_km(43.0, 76.0, 43.0, 76.0) == 0


def test_haversine_known_distance():
    # Алматы центр → ~10 км на север, грубая проверка диапазона
    d = chat._haversine_km(43.238, 76.889, 43.328, 76.889)
    assert 9 < d < 11


# ── _format_orgs_context ──────────────────────────────────────────────────────
def test_format_empty_orgs():
    assert "не найдены" in chat._format_orgs_context([])


def test_format_orgs_with_distance_meters():
    out = chat._format_orgs_context([
        {"nameRu": "Центр", "category": "MEDICAL", "distanceKm": 0.4, "phone": "+7700"},
    ])
    assert "Центр" in out
    assert "400 м от вас" in out
    assert "+7700" in out


def test_format_orgs_with_distance_km():
    out = chat._format_orgs_context([
        {"nameRu": "Клиника", "category": "MEDICAL", "distanceKm": 2.5},
    ])
    assert "2.5 км от вас" in out


# ── search_organizations ──────────────────────────────────────────────────────
def test_search_maps_keyword_to_category_and_calls_core():
    fake_resp = MagicMock()
    fake_resp.json.return_value = [{"nameRu": "Реацентр", "category": "REHABILITATION"}]
    fake_resp.raise_for_status.return_value = None

    with patch("app.chat.httpx.get", return_value=fake_resp) as mock_get:
        rows = chat.search_organizations("нужна реабилитация")

    assert len(rows) == 1
    # категория должна примаппиться по ключевому слову "реабилит"
    _, kwargs = mock_get.call_args
    assert kwargs["params"]["category"] == "REHABILITATION"


def test_search_sorts_by_distance_when_location_given():
    fake_resp = MagicMock()
    fake_resp.json.return_value = [
        {"nameRu": "Дальняя", "lat": 43.40, "lon": 76.95},
        {"nameRu": "Близкая", "lat": 43.239, "lon": 76.889},
    ]
    fake_resp.raise_for_status.return_value = None

    with patch("app.chat.httpx.get", return_value=fake_resp):
        rows = chat.search_organizations("больница", lat=43.238, lon=76.889)

    assert rows[0]["nameRu"] == "Близкая"


def test_search_returns_empty_on_http_error():
    with patch("app.chat.httpx.get", side_effect=Exception("boom")):
        assert chat.search_organizations("что-то") == []


# ── simple_chat / rag_chat / emergency_chat (замоканный Azure-клиент) ──────────
def _fake_completion(content: str):
    msg = MagicMock()
    msg.message.content = content
    resp = MagicMock()
    resp.choices = [msg]
    return resp


def test_simple_chat_returns_model_content():
    with patch.object(chat.client.chat.completions, "create", return_value=_fake_completion("привет")):
        out = chat.simple_chat([{"role": "user", "content": "хай"}])
    assert out == "привет"


def test_rag_chat_includes_org_count():
    with patch("app.chat.search_organizations", return_value=[{"nameRu": "A"}]), \
         patch.object(chat.client.chat.completions, "create", return_value=_fake_completion("ответ")):
        out = chat.rag_chat([{"role": "user", "content": "клиники рядом"}])
    assert out["organizations_found"] == 1
    assert out["answer"] == "ответ"


def test_emergency_chat():
    with patch.object(chat.client.chat.completions, "create", return_value=_fake_completion("112")):
        assert chat.emergency_chat("упал, не встаёт") == "112"
