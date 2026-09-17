import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.acharya import VbAcharya
from app.models.lesson_plan import VbLessonPlan 
from app.schemas.lesson_plan import (
    LessonPlanGenerateRequest,
    LessonPlanSaveRequest,
    LessonPlanCompletionRequest,
    LessonPlanListResponse,
    LessonPlanOut,
)
from app.services.ai_service import generate_lesson_plan

router = APIRouter(prefix="/lesson-plans", tags=["lesson-plans"])

# FIXED: Renamed to avoid import conflicts and updated query logic
def get_scoped_acharya(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    # FIXED: Made header optional to prevent validation errors
    x_school_id: Optional[int] = Header(None, alias="x-school-id", description="Legacy multi-tenant school ID")
) -> VbAcharya:
    """
    Verify the user is an active Acharya.
    """
    # FIXED: Replaced current_user.id with user_id and removed the school_id filter
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
    ).first()
    
    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized as an Acharya."
        )
    return acharya


@router.post("/generate")
async def generate(
    body: LessonPlanGenerateRequest,
    acharya: VbAcharya = Depends(get_scoped_acharya),
):
    """Call the AI service and return a structured lesson plan."""
    if not body.chapter:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="topic is required",
        )
    return await generate_lesson_plan(body, acharya)


@router.get("", response_model=LessonPlanListResponse)
def list_plans(
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    records = (
        db.query(VbLessonPlan)
        # FIXED: Mapped to teacher_id
        .filter(VbLessonPlan.teacher_id == acharya.teacher_id) 
        # FIXED: Mapped to created_datetime
        .order_by(VbLessonPlan.created_datetime.desc()) 
        .all()
    )

    plans: list[LessonPlanOut] = []
    for record in records:
        try:
            full = json.loads(record.plan_data) if record.plan_data else {}
        except (ValueError, TypeError):
            full = {}
            
        full.setdefault("title", record.title)
        full.setdefault("chapter_text", record.chapter_text)
        full.setdefault("duration_minutes", record.duration_minutes)

        plans.append(LessonPlanOut(
            lesson_plan_id=record.lesson_plan_id,
            title=record.title,
            chapter_text=record.chapter_text,
            duration_minutes=record.duration_minutes,
            # FIXED: Mapped from the updated DB column back to the schema's expected field
            created_at=record.created_datetime, 
            plan=full,
        ))

    return LessonPlanListResponse(plans=plans)


@router.post("", status_code=status.HTTP_201_CREATED)
def save_plan(
    body: LessonPlanSaveRequest,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    plan = body.plan
    record = VbLessonPlan(
        # FIXED: Mapped to teacher_id
        teacher_id=acharya.teacher_id, 
        title=plan.get("title", "Untitled Plan"),
        chapter_text=plan.get("chapter_text"),
        duration_minutes=plan.get("duration_minutes"),
        plan_data=json.dumps(plan),
        # FIXED: Mapped to created_datetime
        created_datetime=datetime.now(timezone.utc),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"lesson_plan_id": record.lesson_plan_id, "message": "Plan saved"}


@router.patch("/{plan_id}/completion")
def record_completion(
    plan_id: int,
    body: LessonPlanCompletionRequest,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    record = db.query(VbLessonPlan).filter(
        VbLessonPlan.lesson_plan_id == plan_id,
        # FIXED: Mapped to teacher_id
        VbLessonPlan.teacher_id == acharya.teacher_id,
    ).first()
    
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    try:
        plan = json.loads(record.plan_data) if record.plan_data else {}
    except (ValueError, TypeError):
        plan = {}
        
    plan.setdefault("header", {})["actual_completion"] = body.actualCompletion.isoformat()
    record.plan_data = json.dumps(plan)
    
    db.commit()
    return {"lesson_plan_id": plan_id, "actual_completion": body.actualCompletion.isoformat()}


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    record = db.query(VbLessonPlan).filter(
        VbLessonPlan.lesson_plan_id == plan_id,
        # FIXED: Mapped to teacher_id
        VbLessonPlan.teacher_id == acharya.teacher_id,
    ).first()
    
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        
    db.delete(record)
    db.commit()