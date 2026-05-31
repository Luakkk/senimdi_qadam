"""
Тесты speech.py — маппинг голосов/языков.

speech.py импортирует faster-whisper и edge-tts на верхнем уровне.
Если эти тяжёлые зависимости не установлены — тест пропускается (skip),
а не падает.
"""
import pytest

speech = pytest.importorskip(
    "app.speech",
    reason="faster-whisper / edge-tts не установлены",
)


def test_voice_map_russian():
    assert speech.VOICE_MAP["ru"] == "ru-RU-SvetlanaNeural"
    assert speech.VOICE_MAP["ru-RU"] == "ru-RU-SvetlanaNeural"


def test_voice_map_kazakh():
    assert speech.VOICE_MAP["kk"] == "kk-KZ-AigulNeural"
    assert speech.VOICE_MAP["kk-KZ"] == "kk-KZ-AigulNeural"


def test_whisper_lang_map():
    assert speech.WHISPER_LANG_MAP["ru-RU"] == "ru"
    assert speech.WHISPER_LANG_MAP["kk-KZ"] == "kk"


def test_get_available_voices_returns_both_languages():
    voices = speech.get_available_voices()
    langs = {v["language"] for v in voices}
    assert langs == {"ru-RU", "kk-KZ"}
