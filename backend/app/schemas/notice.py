from datetime import date
from typing import Optional, List
from pydantic import BaseModel


class VbNoticeOut(BaseModel):
    notice_id: int
    
    # UPDATED: Matched exactly to SQLAlchemy column names
    notice_title: Optional[str] = None
    notice_text: Optional[str] = None
    notice_date: Optional[date] = None
    
    # UPDATED: Replaced 'audience' with the actual DB columns
    applicable_class: Optional[str] = None
    applicable_to: Optional[str] = None

    model_config = {"from_attributes": True}


class NoticeListResponse(BaseModel):
    notices: List[VbNoticeOut]
    total: int