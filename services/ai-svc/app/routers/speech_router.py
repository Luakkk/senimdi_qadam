"""
speech_router.py — FastAPI роутер для STT и TTS

POST /speech/transcribe  — аудио → текст (faster-whisper, локально, бесплатно)
POST /speech/synthesize  — текст → MP3  (edge-tts, Microsoft Edge, бесплатно)
GET  /speech/voices      — список доступных голосов
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional

from ..speech import transcribe_audio, synthesize_text, get_available_voices

router = APIRouter(prefix="/speech", tags=["Speech — STT / TTS"])


# ── Схемы ─────────────────────────────────────────────────────────────────────

class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=3000, example="Добро пожаловать на платформу СенімдіҚадам!")
    language: str = Field(
        default="ru-RU",
        example="ru-RU",
        description="Язык синтеза: 'ru-RU' (русский) или 'kk-KZ' (казахский)",
    )


class TranscribeResponse(BaseModel):
    text: str
    language: str
    engine: str = "faster-whisper"


# ── Эндпоинты ─────────────────────────────────────────────────────────────────

@router.post(
    "/transcribe",
    response_model=TranscribeResponse,
    summary="STT: аудио → текст",
    description="""
Распознаёт речь из аудиофайла с помощью **faster-whisper** (локальная модель OpenAI Whisper).

**Поддерживаемые форматы:** WAV, MP3, OGG, WEBM, M4A
**Языки:** русский (`ru-RU`), казахский (`kk-KZ`)
**Движок:** faster-whisper small (150MB, CPU, бесплатно)
    """,
)
async def transcribe(
    file: UploadFile = File(..., description="Аудиофайл (WAV, MP3, OGG, WEBM, M4A)"),
    language: str = Query(
        default="ru-RU",
        description="Язык распознавания: 'ru-RU' или 'kk-KZ'",
        example="ru-RU",
    ),
):
    # Проверяем размер файла (max 25MB)
    audio_bytes = await file.read()
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Файл слишком большой (максимум 25MB)")

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Файл пустой")

    try:
        text = transcribe_audio(audio_bytes, language=language)
        return TranscribeResponse(text=text, language=language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка распознавания: {str(e)}")


@router.post(
    "/synthesize",
    response_class=Response,
    summary="TTS: текст → MP3",
    description="""
Синтезирует речь из текста с помощью **edge-tts** (Microsoft Edge TTS).

**Голоса:**
- `ru-RU` → Светлана (SvetlanaNeural) — русский женский голос
- `kk-KZ` → Айгүл (AigulNeural) — казахский женский голос

**Движок:** edge-tts (бесплатно, без API ключей)
**Формат ответа:** audio/mpeg (MP3)
    """,
    responses={
        200: {
            "content": {"audio/mpeg": {}},
            "description": "MP3 аудиофайл с озвученным текстом",
        }
    },
)
async def synthesize(body: SynthesizeRequest):
    try:
        audio_bytes = synthesize_text(body.text, language=body.language)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "X-Voice": body.language,
                "X-Engine": "edge-tts",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка синтеза речи: {str(e)}")


@router.get(
    "/voices",
    summary="Список доступных голосов",
    description="Возвращает список поддерживаемых языков и голосов для TTS.",
)
def voices():
    return {
        "voices": get_available_voices(),
        "engines": {
            "tts": "edge-tts (Microsoft Edge, бесплатно)",
            "stt": "faster-whisper small (OpenAI Whisper, локально, бесплатно)",
        },
    }
