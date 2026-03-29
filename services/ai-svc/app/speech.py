import azure.cognitiveservices.speech as speechsdk
import tempfile, os
from .config import settings

def transcribe_audio(audio_bytes: bytes, language: str = "ru-RU") -> str:
    """
    STT: аудио → текст
    language: "ru-RU" (русский) или "kk-KZ" (казахский)
    """
    speech_config = speechsdk.SpeechConfig(
        subscription=settings.AZURE_SPEECH_KEY,
        region=settings.AZURE_SPEECH_REGION,
    )
    speech_config.speech_recognition_language = language

    # Сохраняем аудио во временный файл
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        audio_config = speechsdk.AudioConfig(filename=tmp_path)
        recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)
        result = recognizer.recognize_once()

        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return result.text
        else:
            return ""
    finally:
        os.unlink(tmp_path)

def synthesize_text(text: str, language: str = "ru-RU") -> bytes:
    """
    TTS: текст → аудио (mp3)
    language: "ru-RU" → SvetlanaNeural, "kk-KZ" → AigulNeural
    """
    speech_config = speechsdk.SpeechConfig(
        subscription=settings.AZURE_SPEECH_KEY,
        region=settings.AZURE_SPEECH_REGION,
    )
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    # Выбираем голос по языку
    voice_map = {
        "ru-RU": "ru-RU-SvetlanaNeural",
        "kk-KZ": "kk-KZ-AigulNeural",
    }
    speech_config.speech_synthesis_voice_name = voice_map.get(language, "ru-RU-SvetlanaNeural")

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        audio_config = speechsdk.audio.AudioOutputConfig(filename=tmp_path)
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
        result = synthesizer.speak_text_async(text).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            with open(tmp_path, "rb") as f:
                return f.read()
        else:
            raise Exception(f"TTS ошибка: {result.reason}")
    finally:
        os.unlink(tmp_path)
