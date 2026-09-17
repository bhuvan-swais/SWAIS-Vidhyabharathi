from datetime import datetime, timezone
from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.assignment import VbAssignmentMaster, VbAssignmentResult
from app.models.subject import VbSubjectMaster
from app.models.student import VbStudent
from app.models.user import VbUser
from app.models.acharya import VbAcharya
from app.schemas.assignment import AssignmentOut, AssignmentCreate


def _class_student_count(db: Session, class_id: int) -> int:
    # FIXED: Removed school_id parameter and database filter
    if not class_id:
        return 0
    return (
        db.query(VbStudent)
        .filter(
            VbStudent.class_id == class_id, 
            VbStudent.is_active.is_(True)
        )
        .count()
    )


def _subject_name(db: Session, subject_id: int) -> str | None:
    # FIXED: Removed school_id parameter and database filter
    if not subject_id:
        return None
    s = db.query(VbSubjectMaster).filter(
        VbSubjectMaster.subject_id == subject_id
    ).first()
    return s.subject_name if s else None


def _to_out(db: Session, a: VbAssignmentMaster, total_students: int) -> AssignmentOut:
    # FIXED: Removed school_id passing to _subject_name
    submitted = (
        db.query(VbAssignmentResult)
        .filter(
            VbAssignmentResult.assignment_id == a.assignment_id,
            VbAssignmentResult.submitted_at.isnot(None),
        )
        .count()
    )
    return AssignmentOut(
        assignment_id=a.assignment_id,
        title=a.assignment_title,
        subject=_subject_name(db, a.subject_id),
        chapter_id=a.chapter_id,
        due_date=a.due_date,
        submitted_count=submitted,
        total_students=total_students,
    )


def get_assignments(db: Session, acharya: VbAcharya) -> List[AssignmentOut]:
    """All assignments for the teacher's class."""
    if not acharya.class_id:
        return []
    
    # FIXED: Removed acharya.school_id passing
    total_students = _class_student_count(db, acharya.class_id)
    rows = (
        db.query(VbAssignmentMaster)
        .filter(
            VbAssignmentMaster.class_id == acharya.class_id
            # REMOVED: VbAssignmentMaster.school_id filter
        )
        .order_by(VbAssignmentMaster.due_date.asc().nullslast())
        .all()
    )
    # FIXED: Removed acharya.school_id passing
    return [_to_out(db, a, total_students) for a in rows]


def create_assignment(db: Session, acharya: VbAcharya, payload: AssignmentCreate) -> AssignmentOut:
    """Create an assignment."""
    a = VbAssignmentMaster(
        assignment_title=payload.title,
        assignment_text=payload.text,
        subject_id=payload.subject_id,
        chapter_id=payload.chapter_id,
        due_date=payload.due_date,
        class_id=acharya.class_id,
        # REMOVED: school_id=acharya.school_id
        assigned_by=acharya.user_id,
        created_datetime=datetime.now(timezone.utc),
        record_status="Active",
        version_no=1,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    # FIXED: Removed acharya.school_id passing
    return _to_out(db, a, _class_student_count(db, acharya.class_id))