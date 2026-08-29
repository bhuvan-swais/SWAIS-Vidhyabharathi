"""pravesha (login / admission) module — SWAIS VidhyaBharathi.

Real authentication that mints the VBK role-scoped JWT (branch + school_id + role).
Two methods, mirroring the SSS login:
  - Email  (+ optional Google Sign-In verified server-side)
  - Phone  (OTP: hashed, expiring, attempt-limited)

Identity is checked against the branch DB (demo -> dem_prod). The demo shortcut
POST /login {role:"Vidyarthi"} with no email still resolves the first student so
the dashboards keep working without a full login.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import cast, String, func

from app.core.security import get_current_user, create_access_token
from app.core.tenancy import get_branch_session
from app.db.models.common import StudentMaster, TeacherMaster, UserMaster, ClassMaster
from app.services.otp import create_otp, store_otp, send_otp, verify_stored_otp
from app.services.google_auth import verify_google_token, google_configured
from app.core.config import OTP_DELIVERY_MODE, OTP_EXPIRY_MINUTES

router = APIRouter(prefix="/pravesha", tags=["pravesha"])

DEMO_BRANCH = "DEMO"

# role -> which table + columns to authenticate against (demo dem_ schema).
ROLE_MAP = {
    "Vidyarthi":        {"model": StudentMaster, "email": "email_id",    "phone": "mobile_no",    "id": "student_id"},
    "Acharya":          {"model": TeacherMaster, "email": "email_id",    "phone": "phone",        "id": "teacher_id"},
    "Palaka":           {"model": StudentMaster, "email": "parent_email", "phone": "parent_phone", "id": "student_id"},
    "Pradhana Acharya": {"model": UserMaster,    "email": "email_id",    "phone": "mobile_no",    "id": "user_id"},
    "School Admin":     {"model": UserMaster,    "email": "email_id",    "phone": "mobile_no",    "id": "user_id"},
    "Nyasa":            {"model": UserMaster,    "email": "email_id",    "phone": "mobile_no",    "id": "user_id"},
}

AUTH_NOT_AUTHORISED = "Not authorised to login"


def _cfg(role: str) -> dict:
    cfg = ROLE_MAP.get(role)
    if not cfg:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid role selected.")
    return cfg


def _norm_phone(phone: str) -> str:
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


def _by_email(db, cfg: dict, email: str):
    col = getattr(cfg["model"], cfg["email"])
    return db.query(cfg["model"]).filter(func.lower(cast(col, String)) == email.strip().lower()).first()


def _by_phone(db, cfg: dict, phone: str):
    digits = _norm_phone(phone)
    if not digits:
        return None
    col = getattr(cfg["model"], cfg["phone"])
    return db.query(cfg["model"]).filter(cast(col, String).like(f"%{digits}")).first()


def _resolve_school_id(db, user) -> int | None:
    """Return school_id for any user object.
    UserMaster already carries it. For Student/Teacher look it up via ClassMaster."""
    sid = getattr(user, "school_id", None)
    if sid:
        return sid
    class_id = getattr(user, "class_id", None)
    if class_id:
        cls = db.query(ClassMaster).filter(ClassMaster.class_id == class_id).first()
        if cls:
            return cls.school_id
    return None


def _mint(user, cfg: dict, role: str, sub: str, school_id=None) -> str:
    return create_access_token({
        "sub": sub,
        "user_id": getattr(user, cfg["id"]),
        "branch": DEMO_BRANCH,
        "school_id": str(school_id) if school_id is not None else None,
        "role": role,
    })


def _public_user(user, cfg: dict) -> dict:
    return {
        "id": getattr(user, cfg["id"]),
        "full_name": getattr(user, "full_name", None),
        "email": getattr(user, cfg["email"], None),
        "role": getattr(user, "role", None),
    }


# ----------------------------- request models -----------------------------
class CheckEmailIn(BaseModel):
    email: str
    role: str


class CheckPhoneIn(BaseModel):
    phone: str
    role: str


class VerifyOtpIn(BaseModel):
    phone: str
    role: str
    otp: str


class LoginIn(BaseModel):
    email: str | None = None
    role: str = "Vidyarthi"
    google_token: str | None = None


# ----------------------------- email + google -----------------------------
@router.post("/check-email")
def check_email(body: CheckEmailIn):
    cfg = _cfg(body.role)
    db = get_branch_session(DEMO_BRANCH)
    try:
        if not _by_email(db, cfg, body.email):
            raise HTTPException(status.HTTP_404_NOT_FOUND, AUTH_NOT_AUTHORISED)
        return {"exists": True, "role": body.role, "email": body.email, "requiresGoogleAuth": google_configured()}
    finally:
        db.close()


@router.post("/login")
def login(body: LoginIn):
    cfg = _cfg(body.role)
    db = get_branch_session(DEMO_BRANCH)
    try:
        # Demo shortcut: no email + Vidyarthi -> first student (keeps dashboards working).
        if not body.email and body.role == "Vidyarthi":
            student = (db.query(StudentMaster)
                       .filter(StudentMaster.class_id.isnot(None))
                       .order_by(StudentMaster.student_id).first())
            if not student:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "No student found for demo login")
            school_id = _resolve_school_id(db, student)
            token = _mint(student, cfg, body.role, student.email_id or "demo-vidyarthi", school_id)
            return {"authenticated": True, "access_token": token, "token_type": "bearer",
                    "role": body.role, "user_id": student.student_id, "user": _public_user(student, cfg)}

        if not body.email and body.role == "Acharya":
            # Prefer a teacher with a class assigned (so school_id can be resolved).
            # Fall back to any teacher if the demo data has no class assignments.
            teacher = (db.query(TeacherMaster)
                       .filter(TeacherMaster.class_id.isnot(None))
                       .order_by(TeacherMaster.teacher_id).first())
            if not teacher:
                teacher = db.query(TeacherMaster).order_by(TeacherMaster.teacher_id).first()
            if not teacher:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "No teacher found for demo login")
            school_id = _resolve_school_id(db, teacher)
            if not school_id:
                # Demo: teacher has no class assignment; borrow school_id from ClassMaster.
                cls = db.query(ClassMaster).filter(ClassMaster.school_id.isnot(None)).first()
                school_id = cls.school_id if cls else None
            token = _mint(teacher, cfg, body.role, teacher.email_id or "demo-acharya", school_id)
            return {"authenticated": True, "access_token": token, "token_type": "bearer",
                    "role": body.role, "user_id": teacher.teacher_id, "user": _public_user(teacher, cfg)}

        if not body.email and body.role == "School Admin":
            # Prefer a user whose role column is "School Admin" and has a school_id.
            # Fall back to any user with school_id, then any user at all.
            admin = (db.query(UserMaster)
                     .filter(UserMaster.role == "School Admin", UserMaster.school_id.isnot(None))
                     .order_by(UserMaster.user_id).first())
            if not admin:
                admin = (db.query(UserMaster)
                         .filter(UserMaster.school_id.isnot(None))
                         .order_by(UserMaster.user_id).first())
            if not admin:
                admin = db.query(UserMaster).order_by(UserMaster.user_id).first()
            if not admin:
                raise HTTPException(status.HTTP_404_NOT_FOUND, "No School Admin found for demo login")
            school_id = admin.school_id
            if not school_id:
                # Demo: UserMaster has no school_id; borrow from ClassMaster.
                cls = db.query(ClassMaster).filter(ClassMaster.school_id.isnot(None)).first()
                school_id = cls.school_id if cls else None
            token = _mint(admin, cfg, body.role, admin.email_id or "demo-admin", school_id)
            return {"authenticated": True, "access_token": token, "token_type": "bearer",
                    "role": body.role, "user_id": admin.user_id, "user": _public_user(admin, cfg)}

        if not body.email:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email is required.")

        user = _by_email(db, cfg, body.email)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, AUTH_NOT_AUTHORISED)

        # Google configured but no token yet -> tell the client to run the Google flow.
        if google_configured() and not body.google_token:
            return {"authenticated": False, "requiresGoogleAuth": True}
        if body.google_token:
            verify_google_token(body.google_token, body.email)

        school_id = _resolve_school_id(db, user)
        token = _mint(user, cfg, body.role, body.email, school_id)
        return {"authenticated": True, "access_token": token, "token_type": "bearer",
                "role": body.role, "user_id": getattr(user, cfg["id"]), "user": _public_user(user, cfg)}
    finally:
        db.close()


# ----------------------------- phone + otp -----------------------------
@router.post("/check-phone")
def check_phone(body: CheckPhoneIn):
    cfg = _cfg(body.role)
    db = get_branch_session(DEMO_BRANCH)
    try:
        user = _by_phone(db, cfg, body.phone)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, AUTH_NOT_AUTHORISED)
        otp = create_otp()
        store_otp(db, _norm_phone(body.phone), body.role, otp)
        send_otp(body.phone, otp)
        resp = {"otpSent": True, "role": body.role, "phone": _norm_phone(body.phone),
                "expiresInMinutes": OTP_EXPIRY_MINUTES}
        if OTP_DELIVERY_MODE == "console":
            resp["devOtp"] = otp  # dev/testing only
        return resp
    finally:
        db.close()


@router.post("/verify-otp")
def verify_otp(body: VerifyOtpIn):
    cfg = _cfg(body.role)
    db = get_branch_session(DEMO_BRANCH)
    try:
        user = _by_phone(db, cfg, body.phone)
        if not user:
            raise HTTPException(status.HTTP_404_NOT_FOUND, AUTH_NOT_AUTHORISED)
        verify_stored_otp(db, _norm_phone(body.phone), body.role, body.otp.strip())
        school_id = _resolve_school_id(db, user)
        token = _mint(user, cfg, body.role, _norm_phone(body.phone), school_id)
        return {"authenticated": True, "access_token": token, "token_type": "bearer",
                "role": body.role, "user_id": getattr(user, cfg["id"]), "user": _public_user(user, cfg)}
    finally:
        db.close()


@router.get("/ping")
def ping(user: dict = Depends(get_current_user)):
    return {"module": "pravesha", "branch": user["branch"], "school_id": user.get("school_id"), "role": user["role"]}
