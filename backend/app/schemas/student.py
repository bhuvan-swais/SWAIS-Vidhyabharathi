from typing import Optional, List
from pydantic import BaseModel

class StudentOut(BaseModel):
    student_id:    int
    full_name:     Optional[str] = None
    roll_no:       Optional[str] = None
    gender:        Optional[str] = None  # Remains for frontend styling, defaults to None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    section:       Optional[str] = None
    
    # ADDED: New mapping fields in case the frontend relies on them
    mobile_no:     Optional[str] = None
    email_id:      Optional[str] = None

    model_config = {"from_attributes": True}

class StudentListResponse(BaseModel):
    students: List[StudentOut]
    total:    int