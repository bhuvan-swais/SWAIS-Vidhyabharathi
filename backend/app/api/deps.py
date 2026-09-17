"""
Shared FastAPI dependencies for VBK Faculty! Architecture.
get_current_user — verifies JWT and returns the base VbUser.
get_current_acharya — verifies user and returns the VbAcharya profile.
"""

from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import VbUser
from app.models.acharya import VbAcharya

bearer_scheme = HTTPBearer()

# Mock data for local development bypassing auth
class MockUser:
    user_id = 1
    # FIXED: Mapped login_id to email based on your schema updates
    email = "dev@vbkfaculty.edu"

# FIXED: Replaced SQLAlchemy model instantiation with a standard Mock class
# This prevents validation crashes from deprecated kwargs like 'user_id' or 'id'
class MockAcharya:
    teacher_id = 1
    user_id = 1
    class_id = 8
    section = "A" # FIXED: section_1 to section
    is_active = True
    user = MockUser()

_DEV_ACHARYA = MockAcharya()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> VbUser:
    """Decodes the JWT and fetches the base User record."""
    token = credentials.credentials

    if settings.APP_ENV == "development" and token == "dev":
        return MockUser()

    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token missing user identity (sub)"
        )

    user = db.query(VbUser).filter(VbUser.user_id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return user


def get_current_acharya(
    db: Session = Depends(get_db),
    current_user: VbUser = Depends(get_current_user),
    # FIXED: Made the header completely optional to prevent frontend crashes
    x_school_id: Optional[int] = Header(None, alias="x-school-id", description="Legacy multi-tenant school ID")
) -> VbAcharya:
    """
    Ensures the current authenticated user is an active Acharya.
    """
    if settings.APP_ENV == "development" and current_user.user_id == 1:
        return _DEV_ACHARYA

    # FIXED: Removed VbAcharya.school_id filter entirely
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id,
        VbAcharya.is_active == True
    ).first()

    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as an Acharya."
        )

    return acharya