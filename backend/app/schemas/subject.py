from typing import Optional, List
from pydantic import BaseModel

class SubjectOut(BaseModel):
    subject_id: int
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    
    # ADDED: Relational IDs based on database schema
    class_id: Optional[int] = None
    teacher_id: Optional[int] = None

    model_config = {"from_attributes": True}


class SubjectListResponse(BaseModel):
    subjects: List[SubjectOut]
    total: int