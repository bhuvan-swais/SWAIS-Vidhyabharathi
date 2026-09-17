from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
# FIXED: Imported get_current_user instead of get_current_acharya to fix the circular dependency bug below
from app.api.deps import get_current_user
from app.models.acharya import VbAcharya
from app.models.assessment import VbAssessment, VbAssessmentResult
from app.schemas.assessment import (
    AssessmentListResponse, AssessmentOut, AssessmentDetailOut, ResultOut
)

# Note: The code provided was for assessments, despite the filename you mentioned.
router = APIRouter(prefix="/assessments", tags=["assessments"])

# FIXED: Renamed to get_scoped_acharya to avoid conflict with imports, though you can use the global one in deps.py
def get_scoped_acharya(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user), # FIXED: Changed to get_current_user to prevent infinite loop
    x_school_id: Optional[int] = Header(None, alias="x-school-id", description="Legacy multi-tenant school ID")
) -> VbAcharya:
    """
    Verify the user is an active Acharya.
    """
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
        # REMOVED: VbAcharya.school_id == x_school_id (Does not exist in DB)
    ).first()
    
    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized as an Acharya."
        )
    return acharya

def _build_out(a: VbAssessment) -> AssessmentOut:
    results_with_marks = [r for r in a.results if not r.is_absent and r.marks_obtained is not None]
    avg = (
        round(sum(float(r.marks_obtained) for r in results_with_marks) / len(results_with_marks), 1)
        if results_with_marks else None
    )
    return AssessmentOut(
        assessment_id=a.assessment_id,
        title=a.title,
        subject=a.subject,
        chapter=a.chapter,
        assessment_type=a.assessment_type,
        max_marks=float(a.max_marks),
        assessment_date=a.assessment_date,
        total_students=len(a.results),
        submitted=len(results_with_marks),
        class_average=avg,
    )

def _build_result(r: VbAssessmentResult, max_marks: float) -> ResultOut:
    pct = (
        round(float(r.marks_obtained) / max_marks * 100, 1)
        if r.marks_obtained is not None and not r.is_absent else None
    )
    return ResultOut(
        result_id=r.result_id,
        student_id=r.student_id,
        student_name=r.student_name,
        roll_number=r.roll_number,
        marks_obtained=float(r.marks_obtained) if r.marks_obtained is not None else None,
        max_marks=max_marks,
        percentage=pct,
    )

@router.get("", response_model=AssessmentListResponse)
def list_assessments(
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    assessments = (
        db.query(VbAssessment)
        # FIXED: Maps accurately to teacher_id instead of the old acharya.id
        .filter(VbAssessment.teacher_id == acharya.teacher_id) 
        .order_by(VbAssessment.assessment_date.desc())
        .all()
    )
    return AssessmentListResponse(
        assessments=[_build_out(a) for a in assessments],
        total=len(assessments),
    )

@router.get("/{assessment_id}", response_model=AssessmentDetailOut)
def get_assessment(
    assessment_id: int,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    a = db.query(VbAssessment).filter(
        VbAssessment.assessment_id == assessment_id,
        # FIXED: Maps accurately to teacher_id instead of the old acharya.id
        VbAssessment.teacher_id == acharya.teacher_id, 
    ).first()
    
    if not a:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    max_marks = float(a.max_marks)
    out = _build_out(a)
    results = sorted(
        [_build_result(r, max_marks) for r in a.results],
        key=lambda x: x.roll_number,
    )
    return AssessmentDetailOut(**out.model_dump(), results=results)