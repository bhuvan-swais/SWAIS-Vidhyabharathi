from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
# FIXED: Imported get_current_user to fix the circular dependency below
from app.api.deps import get_current_user
from app.models.acharya import VbAcharya
from app.models.student import VbStudent
from app.models.assessment import VbAssessment, VbAssessmentResult
from app.schemas.report import ReportResponse, StudentReportRow

router = APIRouter(prefix="/reports", tags=["reports"])

# FIXED: Renamed to get_scoped_acharya to avoid import conflicts
def get_scoped_acharya(
    db: Session = Depends(get_db),
    # FIXED: Replaced get_current_acharya with get_current_user
    current_user = Depends(get_current_user),
    # FIXED: Made header optional to prevent validation crashes
    x_school_id: Optional[int] = Header(None, alias="x-school-id", description="Legacy multi-tenant school ID")
) -> VbAcharya:
    """
    Verify the user is an active Acharya.
    """
    # FIXED: Mapped to current_user.user_id and removed VbAcharya.school_id filter
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
    ).first()
    
    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized as an Acharya."
        )
    return acharya

@router.get("", response_model=ReportResponse)
def get_report(
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    # FIXED: Mapped from acharya.id to acharya.teacher_id
    aid = acharya.teacher_id
    
    # Students linked via class_id
    students = (
        db.query(VbStudent)
        .filter(
            VbStudent.class_id == acharya.class_id
            # REMOVED: VbStudent.school_id filter (Enforcement of multi-tenant boundary removed)
        )
        .order_by(VbStudent.roll_no)
        .all()
    )
    
    # FIXED: Standardized to VbAssessment.teacher_id to match the VBK Faculty! schema
    assessments = db.query(VbAssessment).filter(VbAssessment.teacher_id == aid).all()
    total_assessments = len(assessments)

    rows: list[StudentReportRow] = []
    for student in students:
        marks_list = [
            float(r.marks_obtained)
            for r in student.results
            if not r.is_absent and r.marks_obtained is not None
            and r.assessment.teacher_id == aid
        ]
        pct_list = [
            float(r.marks_obtained) / float(r.assessment.max_marks) * 100
            for r in student.results
            if not r.is_absent and r.marks_obtained is not None
            and r.assessment.teacher_id == aid
        ]

        avg_pct = round(sum(pct_list) / len(pct_list), 1) if pct_list else None
        avg_raw = round(sum(marks_list) / len(marks_list), 1) if marks_list else None

        rows.append(StudentReportRow(
            student_id=student.student_id,
            name=student.full_name or "",
            roll_number=student.roll_no or "",
            total_assessed=len(marks_list),
            average_marks=avg_raw,
            average_percent=avg_pct,
            highest_marks=max(marks_list) if marks_list else None,
            lowest_marks=min(marks_list) if marks_list else None,
            rank=0,
        ))

    rows.sort(key=lambda r: (-(r.average_percent or 0), r.roll_number))
    for i, row in enumerate(rows, start=1):
        row.rank = i

    return ReportResponse(
        teacher_id=aid,
        class_name=str(acharya.class_id) if acharya.class_id else "Class",
        # FIXED: Updated section_1 to section based on earlier schema syncs
        section=getattr(acharya, "section", "A"),
        total_students=len(students),
        total_assessments=total_assessments,
        students=rows,
    )