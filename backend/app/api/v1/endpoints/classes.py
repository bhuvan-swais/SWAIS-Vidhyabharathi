from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.acharya import VbAcharya
from app.models.class_master import VbClassMaster
from app.models.subject import VbSubjectMaster

router = APIRouter(prefix="/classes", tags=["classes"])

# FIXED: Renamed to get_scoped_acharya to avoid conflict if imported elsewhere
def get_scoped_acharya(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    # FIXED: Made the header optional so the frontend doesn't break if it sends it
    x_school_id: Optional[int] = Header(None, alias="x-school-id", description="Legacy multi-tenant school ID")
) -> VbAcharya:
    """Verify the user is an active Acharya."""
    
    # Dynamically fetch the correct primary key attribute
    user_pk = getattr(current_user, "user_id", getattr(current_user, "id", None))
    
    # FIXED: Removed VbAcharya.school_id filter (Does not exist in DB)
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == user_pk
    ).first()
    
    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized as an Acharya."
        )
    return acharya

@router.get("")
def list_classes(
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    subject_classes = db.query(VbSubjectMaster.class_id).filter(
        VbSubjectMaster.class_id.isnot(None)
    )

    rows = (
        db.query(VbClassMaster)
        .filter(
            # REMOVED: VbClassMaster.school_id filter (Does not exist in DB)
            VbClassMaster.class_name.isnot(None),
            VbClassMaster.class_name != "",
            ~VbClassMaster.class_name.ilike("TEST_%"),
            VbClassMaster.class_id.in_(subject_classes),
        )
        .order_by(VbClassMaster.class_name)
        .all()
    )

    classes = [
        {
            "class_id":   row.class_id,
            "class_name": row.class_name,
            "section":    row.section_name,
            "label":      f"{row.class_name}{' - ' + row.section_name if row.section_name else ''}",
        }
        for row in rows
    ]
    return {"classes": classes}