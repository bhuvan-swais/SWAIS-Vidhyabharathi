from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import translate_text, translate_audio

router = APIRouter(prefix="/translate", tags=["translate"])


class TextTranslateRequest(BaseModel):
    text: str
    targetLanguage: str


class AudioTranslateRequest(BaseModel):
    audioFile: str
    targetLanguage: str


@router.post("/text")
async def translate_text_endpoint(
    body: TextTranslateRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await translate_text(
        text=body.text,
        target_language=body.targetLanguage,
        acharya=acharya,
    )


@router.post("/audio")
async def translate_audio_endpoint(
    body: AudioTranslateRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await translate_audio(
        audio_file=body.audioFile,
        target_language=body.targetLanguage,
        acharya=acharya,
    )
