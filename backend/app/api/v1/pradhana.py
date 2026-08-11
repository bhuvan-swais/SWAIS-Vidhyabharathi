"""Pradhana Acharya (Principal / Headmaster) module — SWAIS VidhyaBharathi.

Ported from the demo Headmaster-Dashboard. Principal = read-only school
oversight: KPIs, teacher/class listings, notices. Role-gated to Pradhana Acharya.
"""
from fastapi import APIRouter, Depends
from app.core.security import require_role
from app.core.scoping import get_branch_db
from app.db.models.common import (
    StudentMaster, TeacherMaster, ClassMaster, NoticeBoard,
)

router = APIRouter(prefix="/pradhana", tags=["pradhana"])
PRINCIPAL = require_role("Pradhana Acharya")


@router.get("/kpis")
def school_kpis(db=Depends(get_branch_db), user: dict = Depends(PRINCIPAL)):
    """School KPIs for the principal dashboard."""
    return {
        "total_students": db.query(StudentMaster).filter(StudentMaster.is_active.is_(True)).count(),
        "total_teachers": db.query(TeacherMaster).filter(TeacherMaster.is_active.is_(True)).count(),
        "total_classes": db.query(ClassMaster).count(),
    }


@router.get("/teachers")
def teachers(db=Depends(get_branch_db), user: dict = Depends(PRINCIPAL)):
    rows = db.query(TeacherMaster).order_by(TeacherMaster.full_name).all()
    return [{"teacher_id": t.teacher_id, "full_name": t.full_name, "email_id": t.email_id,
             "subject_name": t.subject_name, "class_id": t.class_id,
             "is_active": t.is_active} for t in rows]


@router.get("/classes")
def classes(db=Depends(get_branch_db), user: dict = Depends(PRINCIPAL)):
    rows = db.query(ClassMaster).order_by(ClassMaster.class_name).all()
    return [{"class_id": c.class_id, "class_name": c.class_name, "section_name": c.section_name,
             "academic_year": c.academic_year, "class_teacher_id": c.class_teacher_id} for c in rows]


@router.get("/notices")
def notices(db=Depends(get_branch_db), user: dict = Depends(PRINCIPAL)):
    rows = db.query(NoticeBoard).order_by(NoticeBoard.notice_date.desc()).limit(50).all()
    return [{"notice_id": n.notice_id, "title": n.notice_title, "text": n.notice_text,
             "date": n.notice_date, "applicable_to": n.applicable_to} for n in rows]
