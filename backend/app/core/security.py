"""Authentication & authorization — SWAIS VidhyaBharathi (Pravesha).

The login token carries the full tenancy path + role:
    { "sub", "user_id", "branch", "school_id", "role" }

- branch    -> which database (BVK1, BVK2, ...)
- school_id -> which school within that branch (None for Nyasa/trust-level)
- role      -> Vidyarthi / Acharya / Palaka / Pradhana Acharya / Nyasa / School Admin
"""
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

bearer_scheme = HTTPBearer()

# Roles that operate above a single school (see one whole branch).
BRANCH_LEVEL_ROLES = {"Nyasa"}


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    if not payload.get("branch"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token missing branch")
    return payload  # {sub, user_id, branch, school_id, role}


def require_role(*allowed: str):
    """Endpoint guard: only the listed roles may proceed. This is the REAL
    security — frontend routing is only UX. Every protected endpoint uses this."""
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in allowed:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Not authorized for this role")
        return user
    return checker
