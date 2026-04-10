"""
speech.py — STT и TTS для SenimdiQAdam

STT: faster-whisper (локальная модель OpenAI Whisper, бесплатно, CPU)
     Модель: small (~150MB), язык: ru / kk
     Документация: https://github.com/SYSTRAN/faster-whisper

TTS: edge-tts (Microsoft Edge TTS, бесплатно, без API ключа)
     Голоса: ru-RU-SvetlanaNeural, kk-KZ-AigulNeural
     Документация: https://github.com/rany2/edge-tts
"""

import asyncio
import os
import tempfile
from functools import lru_cache

import edge_tts
from faster_whisper import WhisperModel

# ── Конфигурация голосов ──────────────────────────────────────────────────────

VOICE_MAP = {
    "ru-RU": "ru-RU-SvetlanaNeural",   # русский женский голос
    "ru":    "ru-RU-SvetlanaNeural",
    "kk-KZ": "kk-KZ-AigulNeural",     # казахский женский голос
    "kk":    "kk-KZ-AigulNeural",
}

WHISPER_LANG_MAP = {
    "ru-RU": "ru",
    "ru":    "ru",
    "kk-KZ": "kk",
    "kk":    "kk",
}

DEFAULT_VOICE    = "ru-RU-SvetlanaNeural"
DEFAULT_LANGUAGE = "ru"

# ── Whisper модель (загружается один раз при старте) ──────────────────────────

@lru_cache(maxsize=1)
def _get_whisper_model() -> WhisperModel:
    """
    Загружаем модель один раз. @lru_cache гарантирует синглтон.
    Размер: small (~150MB) — хорошее качество для русского.
    Если нужно быстрее — замени на "tiny" (~75MB).
    """
    print("[speech] Loading Whisper model 'small'...")
    model = WhisperModel("small", device="cpu", compute_type="int8")
    print("[speech] Whisper model loaded ✓")
    return model


# ── STT: аудио → текст ───────────────────────────────────────────────────────

def transcribe_audio(audio_bytes: bytes, language: str = "ru-RU") -> str:
    """
    Преобразует аудио в текст с помощью faster-whisper.

    Args:
        audio_bytes: байты аудиофайла (WAV, MP3, OGG, WEBM, M4A)
        language:    язык распознавания — "ru-RU" (русский) или "kk-KZ" (казахский)

    Returns:
        Распознанный текст. Пустая строка если не удалось распознать.
    """
    whisper_lang = WHISPER_LANG_MAP.get(language, DEFAULT_LANGUAGE)
    model = _get_whisper_model()

    # Сохраняем во временный файл (faster-whisper принимает путь к файлу)
    suffix = ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(
            tmp_path,
            language=whisper_lang,
            beam_size=5,
            vad_filter=True,          # убираем тишину автоматически
            vad_parameters=dict(
                min_silence_duration_ms=500,
            ),
        )
        text = " ".join(seg.text.strip() for seg in segments)
        print(f"[speech/stt] detected lang: {info.language}, text: {text[:80]}")
        return text.strip()
    except Exception as e:
        print(f"[speech/stt] error: {e}")
        return ""
    finally:
        os.unlink(tmp_path)


# ── TTS: текст → MP3 ─────────────────────────────────────────────────────────

def synthesize_text(text: str, language: str = "ru-RU") -> bytes:
    """
    Преобразует текст в аудио MP3 с помощью edge-tts (Microsoft Edge TTS).
    Бесплатно, без API ключей, работает через интернет.

    Args:
        text:     текст для озвучивания
        language: "ru-RU" (SvetlanaNeural) или "kk-KZ" (AigulNeural)

    Returns:
        Байты MP3 аудиофайла.
    """
    voice = VOICE_MAP.get(language, DEFAULT_VOICE)

    async def _synthesize() -> bytes:
        communicate = edge_tts.Communicate(text=text, voice=voice)
        audio = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio += chunk["data"]
        return audio

    try:
        # Запускаем async функцию синхронно
        audio = asyncio.run(_synthesize())
        print(f"[speech/tts] voice={voice}, chars={len(text)}, bytes={len(audio)}")
        return audio
    except Exception as e:
        print(f"[speech/tts] error: {e}")
        raise


# ── Список доступных голосов ──────────────────────────────────────────────────

def get_available_voices() -> list[dict]:
    """Возвращает список поддерживаемых голосов с метаданными."""
    return [
        {
            "language": "ru-RU",
            "voice": "ru-RU-SvetlanaNeural",
            "name": "Светлана",
            "description": "Русский женский голос (Neural)",
            "engine": "edge-tts",
        },
        {
            "language": "kk-KZ",
            "voice": "kk-KZ-AigulNeural",
            "name": "Айгүл",
            "description": "Казахский женский голос (Neural)",
            "engine": "edge-tts",
        },
    ]
