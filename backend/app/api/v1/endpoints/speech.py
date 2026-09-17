from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import speech_to_text, text_to_speech

router = APIRouter(prefix="/speech", tags=["speech"])


class SpeechToTextRequest(BaseModel):
    audioFile: str
    language: str = "English"


class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "English"
    voice: str = "Female"


@router.post("/to-text")
async def stt(
    body: SpeechToTextRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await speech_to_text(
        audio_file=body.audioFile,
        language=body.language,
        acharya=acharya,
    )


@router.post("/to-voice")
async def tts(
    body: TextToSpeechRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await text_to_speech(
        text=body.text,
        language=body.language,
        voice=body.voice,
        acharya=acharya,
    )
