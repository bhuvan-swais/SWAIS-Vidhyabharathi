from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.schemas.panchakosha import PanchakoshaScoreCreate, PanchakoshaScoreResponse
from app.models.acharya import VbAcharya
from app.models.panchakosha import VbPanchakoshaScore

router = APIRouter()

@router.post("/scores", response_model=PanchakoshaScoreResponse)
def submit_panchakosha_score(
    payload: PanchakoshaScoreCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    # FIXED: Made header optional to prevent validation crashes
    x_school_id: Optional[int] = Header(None, description="Legacy multi-tenant school ID")
):
    """
    Submit a new evidence-based holistic score for a student.
    """
    # FIXED: Mapped to current_user.user_id and removed the school_id filter
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
    ).first()

    if not acharya:
        raise HTTPException(status_code=403, detail="Not authorized as an Acharya.")

    # FIXED: Removed school_id entirely and mapped acharya_id to the accurate teacher_id attribute
    new_score = VbPanchakoshaScore(
        student_id=payload.student_id,
        acharya_id=acharya.teacher_id,
        kosha_id=payload.kosha_id,
        indicator_id=payload.indicator_id,
        score=payload.score,
        evidence_notes=payload.evidence_notes,
        assessment_date=payload.assessment_date
    )

    db.add(new_score)
    db.commit()
    db.refresh(new_score)

    return new_score