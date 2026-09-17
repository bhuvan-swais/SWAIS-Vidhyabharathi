from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class LessonPlanGenerateRequest(BaseModel):
    chapterId: int
    topic: Optional[str] = None
    chapterName: Optional[str] = None
    noOfPeriods: int = 1
    dateOfCommencement: Optional[date] = None
    expectedCompletion: Optional[date] = None
    classSection: Optional[str] = None
    subject: Optional[str] = None
    designation: Optional[str] = None
    schoolName: Optional[str] = None

    @property
    def chapter(self) -> str:
        return (self.topic or self.chapterName or "").strip()

class LessonPlanSaveRequest(BaseModel):
    plan: dict

class LessonPlanCompletionRequest(BaseModel):
    actualCompletion: date

class LessonPlanOut(BaseModel):
    lesson_plan_id: int
    title: str
    chapter_text: Optional[str] = None
    duration_minutes: Optional[int] = None
    created_at: Optional[datetime] = None
    
    # FIXED: Renamed to plan_data to match SQLAlchemy model for auto-serialization
    plan_data: str 

    model_config = {"from_attributes": True} # Upgraded to Pydantic v2

class LessonPlanListResponse(BaseModel):
    plans: list[LessonPlanOut]