from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import content_search

router = APIRouter(prefix="/content", tags=["content"])


class ContentSearchRequest(BaseModel):
    subject: str
    keyword: str


@router.post("/search")
async def search(
    body: ContentSearchRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await content_search(
        subject=body.subject,
        keyword=body.keyword,
        acharya=acharya,
    )
