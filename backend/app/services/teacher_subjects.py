from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.subject import VbSubjectMaster
from app.models.acharya import VbAcharya

def user_id_for(db: Session, acharya: VbAcharya) -> Optional[int]:
    """Returns the internal VbUser ID."""
    return acharya.user_id

def subject_ids_for(db: Session, acharya: VbAcharya) -> List[int]:
    """Subject ids this teacher teaches."""
    if not acharya.class_id:
        return []
        
    assigned = (
        db.query(VbSubjectMaster.subject_id)
        .filter(
            # REMOVED: VbSubjectMaster.school_id filter (Tenant scoping deprecated)
            VbSubjectMaster.class_id == acharya.class_id,
            VbSubjectMaster.record_status == "Active"
        )
        .all()
    )
    return [row[0] for row in assigned]