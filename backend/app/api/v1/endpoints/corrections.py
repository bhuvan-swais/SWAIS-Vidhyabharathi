from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import correct_answer

router = APIRouter(prefix="/corrections", tags=["corrections"])


class CorrectionRequest(BaseModel):
    question: str
    studentAnswer: str
    maxMarks: int = 5
    rubric: str = ""


@router.post("/check")
async def check(
    body: CorrectionRequest,
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await correct_answer(
        question=body.question,
        student_answer=body.studentAnswer,
        max_marks=body.maxMarks,
        rubric=body.rubric,
        acharya=acharya,
    )
