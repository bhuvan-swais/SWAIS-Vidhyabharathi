"""pravesha (login / admission) module — SWAIS VidhyaBharathi.

Issues the role-scoped JWT the rest of the app authenticates with. The token
carries the full tenancy path + role: { sub, user_id, branch, school_id, role }.

NOTE: this is the DEMO login — it resolves a real user for the requested role
from the branch DB so the role dashboards show live data. The production Pravesha
(Google sign-in / OTP verification against dem_users_master) replaces `/login`
later; the token shape and downstream guards (require_role) stay the same.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.core.security import get_current_user, create_access_token
from app.core.tenancy import get_branch_session
from app.db.models.common import StudentMaster

router = APIRouter(prefix="/pravesha", tags=["pravesha"])


class LoginIn(BaseModel):
    email: str | None = None
    role: str = "Vidyarthi"
    branch: str = "DEMO"


@router.post("/login")
def login(body: LoginIn):
    """Demo login: mint a token bound to a real user of the requested role.

    - Vidyarthi: resolves a student in the branch DB (by email if given, else the
      first one) so /vidyarthi/* returns that student's live data.
    - Other roles: issues a role token (their dashboards read shared/global data).
    """
    branch = body.branch
    session = get_branch_session(branch)
    try:
        user_id = None
        school_id = None
        sub = body.email or f"demo-{body.role.lower().replace(' ', '-')}"

        if body.role == "Vidyarthi":
            q = session.query(StudentMaster)
            if body.email:
                q = q.filter(StudentMaster.email_id == body.email)
            student = q.order_by(StudentMaster.student_id).first()
            if not student:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "No student found for demo login")
            user_id = student.student_id
            sub = student.email_id or sub

        token = create_access_token({
            "sub": sub, "user_id": user_id, "branch": branch,
            "school_id": school_id, "role": body.role,
        })
        return {"access_token": token, "token_type": "bearer", "role": body.role, "user_id": user_id}
    finally:
        session.close()


@router.get("/ping")
def ping(user: dict = Depends(get_current_user)):
    return {"module": "pravesha", "branch": user["branch"], "school_id": user.get("school_id"), "role": user["role"]}
