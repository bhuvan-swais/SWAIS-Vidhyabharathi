from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.models.student import VbStudent
from app.schemas.student import StudentListResponse, StudentOut

router = APIRouter(prefix="/students", tags=["students"])

@router.get("", response_model=StudentListResponse)
def list_students(
    acharya: VbAcharya = Depends(get_current_acharya),
    db: Session = Depends(get_db),
):
    students = (
        db.query(VbStudent)
        .filter(
            VbStudent.class_id == acharya.class_id
            # REMOVED: VbStudent.school_id filter (Multi-tenant boundary deprecated)
        )
        .order_by(VbStudent.roll_no)
        .all()
    )
    
    # Note: Ensure your StudentOut schema in app/schemas/student.py is mapping 
    # the new DB columns (e.g., mobile_no and email_id instead of student_phone and student_email)
    return StudentListResponse(
        students=[StudentOut.model_validate(s) for s in students],
        total=len(students),
    )