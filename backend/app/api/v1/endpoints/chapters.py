from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Header
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.acharya import VbAcharya
from app.models.chapter import VbChapterContent
from app.models.chapter_master import VbChapterMaster
from app.services.teacher_subjects import subject_ids_for

router = APIRouter(prefix="/chapters", tags=["chapters"])

# FIXED: Renamed to get_scoped_acharya to avoid conflict if imported elsewhere
def get_scoped_acharya(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    # FIXED: Made the header optional so the frontend doesn't break if it sends it
    x_school_id: Optional[int] = Header(None, alias="x-school-id", description="Legacy multi-tenant school ID")
) -> VbAcharya:
    # FIXED: Removed VbAcharya.school_id filter and mapped to current_user.user_id instead of current_user.id
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
    ).first()
    
    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized as an Acharya."
        )
    return acharya

def _serialise(master: VbChapterMaster, has_content: bool) -> dict:
    return {
        "chapter_id":    master.chapter_id,
        "chapter_name":  master.chapter_name,
        "content_title": master.chapter_name,
        "has_content":   has_content,
    }

@router.get("")
def get_chapters(
    subject_id: Optional[int] = Query(None, description="Filter chapters by subject"),
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    allowed = subject_ids_for(db, acharya)

    if not allowed:
        return {"chapters": [], "reason": "no_subject_assigned"}

    if subject_id is not None and subject_id not in allowed:
        return {"chapters": [], "reason": "subject_not_assigned_to_teacher"}

    wanted = [subject_id] if subject_id is not None else allowed

    masters = (
        db.query(VbChapterMaster)
        .filter(
            VbChapterMaster.subject_id.in_(wanted),
            # REMOVED: VbChapterMaster.school_id filter (Does not exist in DB)
            (VbChapterMaster.record_status == "Active") | (VbChapterMaster.record_status.is_(None)),
        )
        .order_by(VbChapterMaster.chapter_no, VbChapterMaster.chapter_id)
        .all()
    )

    ids = [m.chapter_id for m in masters]
    with_content = set()
    if ids:
        rows = (
            db.query(VbChapterContent.chapter_id)
            .filter(
                VbChapterContent.chapter_id.in_(ids),
                VbChapterContent.is_active == True,
                VbChapterContent.record_status == "Active",
            )
            .all()
        )
        with_content = {r[0] for r in rows}

    return {"chapters": [_serialise(m, m.chapter_id in with_content) for m in masters]}


@router.get("/{chapter_id}")
def get_chapter(
    chapter_id: int,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    master = db.query(VbChapterMaster).filter(
        VbChapterMaster.chapter_id == chapter_id
        # REMOVED: VbChapterMaster.school_id filter (Does not exist in DB)
    ).first()
    
    if not master:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")

    allowed = subject_ids_for(db, acharya)
    if master.subject_id not in allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your subject")

    row = (
        db.query(VbChapterContent)
        .filter(
            VbChapterContent.chapter_id == chapter_id,
            VbChapterContent.is_active == True,
            VbChapterContent.record_status == "Active",
        )
        .first()
    )

    if not row:
        return {
            "chapter_id":    master.chapter_id,
            "chapter_name":  master.chapter_name,
            "content_title": master.chapter_name,
            "content":       "",
            "has_content":   False,
        }

    return {
        "chapter_id":    row.chapter_id,
        "chapter_name":  row.chapter_name,
        "content_title": row.content_title,
        "content":       row.full_text_content or "",
        "has_content":   bool(row.full_text_content),
    }