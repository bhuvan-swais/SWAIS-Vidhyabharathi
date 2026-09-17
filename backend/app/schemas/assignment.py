from datetime import date
from typing import Optional, List
from pydantic import BaseModel


class AssignmentOut(BaseModel):
    assignment_id: int
    assignment_title: Optional[str] = None
    chapter_id: Optional[int] = None
    due_date: Optional[date] = None
    
    # These fields remain assuming you compute them in your endpoint logic
    submitted_count: int = 0
    total_students: int = 0

    # REMOVED: subject (Does not exist in the DB)

    model_config = {"from_attributes": True}


class AssignmentListResponse(BaseModel):
    assignments: List[AssignmentOut]
    total: int


class AssignmentCreate(BaseModel):
    assignment_title: str
    assignment_text: Optional[str] = None
    chapter_id: Optional[int] = None
    due_date: Optional[date] = None
    
    # REMOVED: subject_id (Does not exist in the DB)