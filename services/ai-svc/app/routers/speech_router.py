from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel
from ..speech import transcribe_audio, synthesize_text

router = APIRouter(prefix="/speech", tags=["Speech STT/TTS"])

@router.post("/transcribe")
async def transcribe(
    file: UploadFile = File(..., description="WAV или MP3 аудиофайл"),
    language: str = Query("ru-RU", description="ru-RU или kk-KZ"),
):
    """STT: аудио → текст (Azure Speech)"""
    try:
        audio_bytes = await file.read()
        text = transcribe_audio(audio_bytes, language=language)
        return {"text": text, "language": language}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SynthesizeRequest(BaseModel):
    text: str
    language: str = "ru-RU"  # "ru-RU" или "kk-KZ"

@router.post("/synthesize", response_class=Response)
async def synthesize(body: SynthesizeRequest):
    """TTS: текст → MP3 аудио (Azure Speech)"""
    try:
        audio_bytes = synthesize_text(body.text, language=body.language)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
