from fastapi import APIRouter, Depends

from app.api.deps import get_current_acharya
from app.models.acharya import VbAcharya
from app.services.ai_service import get_assignment_reminders, get_completion_alerts

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.post("/due-date")
async def due_date_alerts(
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await get_assignment_reminders(acharya)

@router.post("/completion")
async def completion_alerts(
    acharya: VbAcharya = Depends(get_current_acharya),
):
    return await get_completion_alerts(acharya)