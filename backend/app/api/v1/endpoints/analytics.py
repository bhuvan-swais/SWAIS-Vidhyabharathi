from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import student_analytics, class_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


class StudentAnalyticsRequest(BaseModel):
    studentName: str
    subject: str


class ClassAnalyticsRequest(BaseModel):
    subject: str


@router.post("/student")
async def student(
    body: StudentAnalyticsRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await student_analytics(
        student_name=body.studentName,
        subject=body.subject,
        acharya=acharya,
    )


@router.post("/class")
async def class_report(
    body: ClassAnalyticsRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await class_analytics(
        subject=body.subject,
        acharya=acharya,
    )