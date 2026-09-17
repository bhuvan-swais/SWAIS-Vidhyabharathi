from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from app.models.assessment import AssessmentType


class ResultOut(BaseModel):
    result_id:      int
    student_id:     int
    student_name:   Optional[str] = None
    roll_number:    str
    marks_obtained: Optional[float] = None
    percentage:     Optional[float] = None
    is_absent:      bool

    model_config = {"from_attributes": True}


class AssessmentOut(BaseModel):
    assessment_id:   int
    title:           Optional[str] = None
    chapter:         Optional[str] = None
    assessment_type: AssessmentType
    max_marks:       Optional[float] = None
    assessment_date: Optional[date] = None
    class_name:      str
    section:         str
    total_students:  Optional[int] = None
    submitted:       Optional[int] = None
    class_average:   Optional[float] = None

    model_config = {"from_attributes": True}


class AssessmentDetailOut(AssessmentOut):
    results: List[ResultOut]


class AssessmentListResponse(BaseModel):
    assessments: List[AssessmentOut]
    total:       int