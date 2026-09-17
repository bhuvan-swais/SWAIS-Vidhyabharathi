from pydantic import BaseModel
from typing import Optional

class PanchakoshaScoreCreate(BaseModel):
    student_id: int
    category: str
    score: int
    remarks: Optional[str] = None

class PanchakoshaScoreResponse(BaseModel):
    id: int
    student_id: int
    category: str
    score: int
    remarks: Optional[str] = None
    
    # UPDATED: Pydantic v2 syntax matching your other schemas
    model_config = {"from_attributes": True}