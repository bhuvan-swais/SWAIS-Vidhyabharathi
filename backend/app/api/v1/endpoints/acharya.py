from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.db.session import get_db
from app.api.deps import get_current_user

from app.models.acharya import VbAcharya
from app.models.student import VbStudent
from app.models.note import VbNote

router = APIRouter()

@router.get("/dashboard-stats", response_model=Dict[str, Any])
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    # Made optional so frontend doesn't break if it sends it, but we ignore it in DB
    x_school_id: Optional[int] = Header(None, description="Legacy multi-tenant school ID")
):
    """
    Fetch aggregated metrics for the Acharya Dashboard cards.
    Scoped strictly to the authenticated teacher.
    """
    # Verify the Acharya belongs to the requested user
    # REMOVED: VbAcharya.school_id filter (Does not exist in DB)
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
    ).first()

    if not acharya:
        raise HTTPException(status_code=403, detail="Not authorized as an Acharya.")

    # Compute actual metrics using updated models
    # REMOVED: school_id filters 
    # UPDATED: VbNote filters by teacher_id, matching your new note.py model
    total_students = db.query(VbStudent).count()
    total_notes = db.query(VbNote).filter(VbNote.teacher_id == acharya.teacher_id).count()
    
    # Placeholders for future implementation
    chapters_covered = 5 
    pending_panchakosha = 8

    return {
        "total_students": total_students,
        "total_notes": total_notes,
        "chapters_covered": chapters_covered,
        "pending_panchakosha": pending_panchakosha
    }