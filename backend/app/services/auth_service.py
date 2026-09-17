from sqlalchemy.orm import Session

from app.models.user import VbUser
from app.models.class_master import VbClassMaster
from app.models.student import VbStudent
from app.models.acharya import VbAcharya
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, TokenResponse


def _class_display(class_name: str) -> str:
    try:
        n = int(class_name)
        if 10 <= n % 100 <= 20:
            suffix = "th"
        else:
            suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
        return f"{n}{suffix} Grade"
    except (ValueError, TypeError):
        return str(class_name)


def get_class_context(db: Session, acharya: VbAcharya) -> tuple[str | None, int]:
    if not acharya.class_id:
        return None, 0

    # FIXED: Removed VbClassMaster.school_id filter
    cls = db.query(VbClassMaster).filter(
        VbClassMaster.class_id == acharya.class_id
    ).first()
    
    class_name = (cls.class_name if cls and cls.class_name else _class_display(acharya.class_id))

    # FIXED: Removed VbStudent.school_id filter
    total_students = (
        db.query(VbStudent)
        .filter(
            VbStudent.class_id == acharya.class_id,
            VbStudent.is_active.is_(True),
        )
        .count()
    )
    return class_name, total_students


def authenticate_user(db: Session, payload: LoginRequest) -> TokenResponse:
    # FIXED: Mapped login_id to email based on new schema
    user = db.query(VbUser).filter(
        VbUser.email == payload.email.lower(),
        VbUser.is_active == True,
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise ValueError("Invalid email or password")

    token = create_access_token(
        data={
            "sub": str(user.user_id),
            "role": "acharya",
        }
    )

    return TokenResponse(
        access_token=token,
        teacher_id=str(user.user_id),  
        school_id=None, # FIXED: Passed None since school_id is deprecated
        name=user.username or "", # FIXED: Mapped first_name to username
        email=user.email, # FIXED: Mapped login_id to email
        subject=None,
        class_assigned=None,
        section=None,
        avatar_initials=(user.username or "")[:2].upper() or None, # FIXED: Mapped first_name to username
        school_name=None,
        total_students=0,
    )