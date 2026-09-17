from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import virtual_slate

router = APIRouter(prefix="/virtual-slate", tags=["virtual-slate"])


class VirtualSlateRequest(BaseModel):
    rawText: str
    action: str = "format"


@router.post("/format")
async def format_slate(
    body: VirtualSlateRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await virtual_slate(
        raw_text=body.rawText,
        action=body.action,
        acharya=acharya,
    )
