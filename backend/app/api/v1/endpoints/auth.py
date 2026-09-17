from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_acharya
from app.core.config import settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.models.acharya import VbAcharya
from app.models.user import VbUser
from app.schemas.auth import LoginRequest, MeResponse, SSOTokenRequest, TokenResponse
from app.services.auth_service import authenticate_user, get_class_context

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """User login. Returns JWT (1-day expiry)."""
    try:
        return authenticate_user(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

@router.get("/me", response_model=MeResponse)
def me(
    acharya: VbAcharya = Depends(get_current_acharya),
    user: VbUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the current Acharya profile."""
    class_display, total_students = get_class_context(db, acharya)
    return MeResponse(
        teacher_id=str(acharya.teacher_id),  # FIXED: Mapped explicitly to teacher_id
        school_id=None,  # FIXED: Safely passing None since it no longer exists
        name=user.username,  # FIXED: Replaced removed first_name with username
        email=user.email,  # FIXED: Replaced removed login_id with email
        subject=getattr(acharya, "subject_name", None),
        class_assigned=class_display,
        section=getattr(acharya, "section", None),  # FIXED: Simplified to section
        avatar_initials=(user.username or "")[:2].upper() if user.username else None,
        school_name=None,
        total_students=total_students,
    )

@router.post("/sso-token", response_model=TokenResponse)
def sso_token(
    payload: SSOTokenRequest,
    x_sso_secret: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    """Internal SSO endpoint — verifies user email and issues JWT."""
    if not settings.SSO_SECRET or x_sso_secret != settings.SSO_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid SSO secret")

    email = payload.email.lower()
    
    # FIXED: Querying VbUser.email instead of the removed login_id column
    user = db.query(VbUser).filter(VbUser.email == email).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    token = create_access_token(data={
        "sub": str(user.user_id),
        "role": "acharya",
    })

    return TokenResponse(
        access_token=token,
        teacher_id=str(user.user_id),
        school_id=None,  # FIXED: Safely passing None
        name=user.username,  # FIXED: Replaced removed first_name with username
        email=email,
        subject=None,
        class_assigned=None,
        section=None,
        avatar_initials=(user.username or "")[:2].upper() if user.username else None,
        school_name=None,
    )

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}