"""panchakosha module — SWAIS VidhyaBharathi.
Every query here is auto-scoped to the caller's branch (DB) + school_id via
app.core.scoping. Never query without scope. See docs/TENANCY.md.
"""
from fastapi import APIRouter, Depends
from app.core.security import get_current_user

router = APIRouter(prefix="/panchakosha", tags=["panchakosha"])


@router.get("/ping")
def ping(user: dict = Depends(get_current_user)):
    return {"module": "panchakosha", "branch": user["branch"], "school_id": user.get("school_id"), "role": user["role"]}
