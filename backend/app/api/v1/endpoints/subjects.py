from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.schemas.subject import SubjectListResponse
from app.services import subject_service

router = APIRouter(prefix="/subjects", tags=["subjects"])

@router.get("", response_model=SubjectListResponse)
def list_subjects(
    class_id: Optional[int] = Query(None, description="Filter by class"),
    acharya: VbAcharya = Depends(get_current_acharya),
    db: Session = Depends(get_db),
):
    subjects = subject_service.get_subjects(db, acharya, class_id=class_id)
    return SubjectListResponse(subjects=subjects, total=len(subjects))