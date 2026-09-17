from typing import List
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.models.notice import VbNoticeBoard
from app.models.acharya import VbAcharya
from app.schemas.notice import VbNoticeOut
from app.services.auth_service import get_class_context


def get_notices(db: Session, acharya: VbAcharya, limit: int = 20) -> List[VbNoticeOut]:
    class_name, _ = get_class_context(db, acharya)

    conds = [
        func.lower(VbNoticeBoard.applicable_class) == "all",
        VbNoticeBoard.applicable_class.ilike("%faculty%"),
        VbNoticeBoard.applicable_class.is_(None),
    ]
    if class_name:
        conds.append(VbNoticeBoard.applicable_class.ilike(f"%{class_name}%"))

    rows = (
        db.query(VbNoticeBoard)
        .filter(
            or_(*conds)
            # REMOVED: VbNoticeBoard.school_id == acharya.school_id (Multi-tenant boundary deprecated)
        )
        .order_by(VbNoticeBoard.notice_date.desc().nullslast())
        .limit(limit)
        .all()
    )
    return [
        VbNoticeOut(
            notice_id=r.notice_id,
            title=r.notice_title,
            text=r.notice_text,
            notice_date=r.notice_date,
            audience=r.applicable_class,
        )
        for r in rows
    ]