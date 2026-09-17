from typing import List
from sqlalchemy.orm import Session

from app.models.subject import VbSubjectMaster
from app.models.acharya import VbAcharya
from app.schemas.subject import SubjectOut

def get_subjects(db: Session, acharya: VbAcharya, class_id=None) -> List[SubjectOut]:
    query = db.query(VbSubjectMaster).filter(
        # REMOVED: VbSubjectMaster.school_id filter (Multi-tenant boundary deprecated)
        VbSubjectMaster.subject_name.isnot(None),
        VbSubjectMaster.subject_name != "",
        ~VbSubjectMaster.subject_name.ilike("TEST_%"),
    )
    
    if class_id is not None:
        query = query.filter(VbSubjectMaster.class_id == class_id)

    rows = query.order_by(VbSubjectMaster.subject_name).all()
    return [
        SubjectOut(
            subject_id=r.subject_id,
            subject_name=r.subject_name,
            subject_code=r.subject_code,
        )
        for r in rows
    ]