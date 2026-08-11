"""School Admin (Prashasana) module — SWAIS VidhyaBharathi.

Ported from the demo Admin-Dashboard. Admin-specific work = user + student
management. Cross-cutting concerns are handled by the shared platform, NOT here:
  - login / Google auth  -> core/security (Pravesha)
  - AI translate / voice  -> the separate stateless AI service
So this router keeps only the genuine admin operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import require_role
from app.core.scoping import get_branch_db
from app.db.models.common import UserMaster, StudentMaster, SchoolMaster

router = APIRouter(prefix="/admin", tags=["admin"])
ADMIN = require_role("School Admin", "Pradhana Acharya")


# ----------------------------- users -----------------------------
@router.get("/users")
def list_users(db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    rows = db.query(UserMaster).order_by(UserMaster.full_name).all()
    return [{"user_id": u.user_id, "full_name": u.full_name, "email_id": u.email_id,
             "role": u.role, "is_active": u.is_active, "school_id": u.school_id} for u in rows]


@router.get("/users/{user_id}")
def get_user(user_id: int, db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    u = db.query(UserMaster).filter(UserMaster.user_id == user_id).first()
    if not u:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return {"user_id": u.user_id, "full_name": u.full_name, "email_id": u.email_id,
            "role": u.role, "is_active": u.is_active}


def _set_active(db, user_id: int, active: bool):
    u = db.query(UserMaster).filter(UserMaster.user_id == user_id).first()
    if not u:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    u.is_active = active
    db.commit()
    return {"user_id": u.user_id, "is_active": u.is_active}


@router.put("/users/{user_id}/activate")
def activate_user(user_id: int, db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    return _set_active(db, user_id, True)


@router.put("/users/{user_id}/deactivate")
def deactivate_user(user_id: int, db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    return _set_active(db, user_id, False)


# ----------------------------- students -----------------------------
@router.get("/students")
def list_students(db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    rows = db.query(StudentMaster).order_by(StudentMaster.full_name).all()
    return [{"student_id": s.student_id, "full_name": s.full_name, "admission_no": s.admission_no,
             "class_id": s.class_id, "section": s.section, "roll_no": s.roll_no,
             "is_active": s.is_active} for s in rows]


class StudentIn(BaseModel):
    full_name: str
    admission_no: str | None = None
    class_id: int | None = None
    section: str | None = None
    roll_no: str | None = None
    email_id: str | None = None
    guardian_name: str | None = None
    guardian_phone: str | None = None


@router.post("/students")
def create_student(body: StudentIn, db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    s = StudentMaster(is_active=True, record_status="Active", **body.model_dump())
    db.add(s)
    db.commit()
    return {"student_id": s.student_id}


# ----------------------------- school -----------------------------
@router.get("/school")
def school_info(db=Depends(get_branch_db), user: dict = Depends(ADMIN)):
    school_id = user.get("school_id")
    s = db.query(SchoolMaster).filter(SchoolMaster.school_id == school_id).first() if school_id else None
    if not s:
        return {"school": None}
    return {"school": {"school_id": s.school_id, "school_name": s.school_name,
                       "city": s.city, "state": s.state}}
