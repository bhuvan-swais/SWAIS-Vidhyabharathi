from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.schemas.notice import NoticeListResponse
from app.services import notice_service

router = APIRouter(prefix="/notices", tags=["notices"])

@router.get("", response_model=NoticeListResponse)
def list_notices(
    acharya: VbAcharya = Depends(get_current_acharya),
    db: Session = Depends(get_db),
):
    items = notice_service.get_notices(db, acharya)
    return NoticeListResponse(notices=items, total=len(items))