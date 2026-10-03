"""Granthalaya (digital library) — SWAIS VidhyaBharathi.

RBAC:
  Vidyarthi (student) : browse / search / read  (+ download if book.download_allowed)
  Acharya (teacher)   : + recommend/request a book, report content, notifications
  Admin               : full CRUD on books & categories, approve/reject requests,
                        resolve reports, view stats & notifications

Everything is school-scoped via get_scoped_db (branch DB + school_id).
Books' cover/PDF live in private S3; served via presigned URLs.
S3 upload endpoints return HTTP 503 when AWS credentials are not configured.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from pydantic import BaseModel

from app.core.security import get_current_user, require_role
from app.core.scoping import get_scoped_db, scope_query
from app.services import s3_service
from app.db.models.granthalaya import (
    Book, BookCategory, BookRequest, ContentReport, ReadingActivity, Notification,
)
from app.db.models.common import TeacherMaster

router = APIRouter(prefix="/granthalaya", tags=["granthalaya"])

ADMIN_ROLES  = ("School Admin", "Pradhana Acharya")
TEACHER_ROLES = ("Acharya",)


# ------------------------------------------------------------------ serializers
def _book_dict(b: Book) -> dict:
    return {
        "book_id":        b.book_id,
        "category_id":    b.category_id,
        "title":          b.title,
        "author":         b.author,
        "publisher":      b.publisher,
        "class_level":    b.class_level,
        "language":       b.language,
        "keywords":       [k.strip() for k in (b.keywords or "").split(",") if k.strip()],
        "cover_key":      b.cover_key,
        "pdf_key":        b.pdf_key,
        "download_allowed": b.download_allowed,
        "view_count":     b.view_count or 0,
        "download_count": b.download_count or 0,
        "status":         b.status,
        "created_at":     b.created_at.isoformat() if b.created_at else None,
        "updated_at":     b.updated_at.isoformat() if b.updated_at else None,
        "school_id":      b.school_id,
    }


def _category_dict(c: BookCategory) -> dict:
    return {
        "category_id": c.category_id,
        "name":        c.name,
        "description": c.description,
        "created_at":  c.created_at.isoformat() if c.created_at else None,
    }


def _request_dict(r: BookRequest, teacher_name: str | None = None) -> dict:
    return {
        "request_id":   r.request_id,
        "requested_by": r.requested_by,
        "teacher_name": teacher_name,
        "title":        r.title,
        "author":       r.author,
        "reason":       r.reason,
        "status":       r.status,
        "reviewed_by":  r.reviewed_by,
        "reviewed_at":  r.reviewed_at.isoformat() if r.reviewed_at else None,
        "created_at":   r.created_at.isoformat() if r.created_at else None,
    }


def _report_dict(r: ContentReport, book_title: str | None = None, reporter_name: str | None = None) -> dict:
    return {
        "report_id":     r.report_id,
        "book_id":       r.book_id,
        "book_title":    book_title,
        "reported_by":   r.reported_by,
        "reporter_name": reporter_name,
        "reason_category": r.reason_category,
        "reason":        r.reason,
        "status":        r.status,
        "resolved_by":   r.resolved_by,
        "resolved_at":   r.resolved_at.isoformat() if r.resolved_at else None,
        "created_at":    r.created_at.isoformat() if r.created_at else None,
    }


def _notification_dict(n: Notification) -> dict:
    return {
        "notification_id": n.notification_id,
        "user_id":    n.user_id,
        "type":       n.type,
        "message":    n.message,
        "is_read":    n.is_read,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


# ------------------------------------------------------------------ helpers
def _log_activity(session, school_id, book_id, user_id, action):
    session.add(ReadingActivity(
        school_id=school_id, book_id=book_id, user_id=user_id, action=action,
    ))


def _notify(session, school_id, user_id, user_role, ntype, message):
    session.add(Notification(
        school_id=school_id, user_id=user_id, user_role=user_role,
        type=ntype, message=message,
    ))


def _get_book_or_404(session, school_id, book_id: int) -> Book:
    book = (scope_query(session.query(Book), Book, school_id)
            .filter(Book.book_id == book_id).first())
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    return book


def _teacher_name(session, user_id: int) -> str | None:
    t = session.query(TeacherMaster).filter(TeacherMaster.teacher_id == user_id).first()
    return t.full_name if t else None


# ------------------------------------------------------------------ browse (all roles)
@router.get("/books")
def list_books(
    scope=Depends(get_scoped_db),
    user: dict = Depends(get_current_user),
    q: str | None = Query(None, description="title/author/publisher/keywords"),
    category_id: int | None = None,
    class_level: str | None = None,
    language: str | None = None,
    include_inactive: bool = Query(False, description="Admin only: include Inactive books"),
):
    """Listing with search + filters. Admins may pass include_inactive=true."""
    session, school_id = scope
    query = scope_query(session.query(Book), Book, school_id)
    if not (include_inactive and user.get("role") in ADMIN_ROLES):
        query = query.filter(Book.status == "Active")
    if q:
        like = f"%{q}%"
        query = query.filter(
            Book.title.ilike(like) | Book.author.ilike(like)
            | Book.publisher.ilike(like) | Book.keywords.ilike(like)
        )
    if category_id:
        query = query.filter(Book.category_id == category_id)
    if class_level:
        query = query.filter(Book.class_level == class_level)
    if language:
        query = query.filter(Book.language == language)
    return [_book_dict(b) for b in query.order_by(Book.title).all()]


@router.get("/books/{book_id}")
def book_details(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    book = _get_book_or_404(session, school_id, book_id)
    book.view_count = (book.view_count or 0) + 1
    _log_activity(session, book.school_id, book.book_id, user["user_id"], "view")
    session.commit()
    return _book_dict(book)


@router.get("/books/{book_id}/read")
def read_book(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    """Return a short-lived presigned URL to read the PDF in the browser."""
    session, school_id = scope
    book = _get_book_or_404(session, school_id, book_id)
    if not book.pdf_key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No PDF available for this book")
    if not s3_service.s3_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE,
                            "S3 is not configured. PDF reading requires S3 access.")
    _log_activity(session, book.school_id, book.book_id, user["user_id"], "read")
    session.commit()
    return {"url": s3_service.presign_get(book.pdf_key)}


@router.get("/books/{book_id}/download")
def download_book(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    book = _get_book_or_404(session, school_id, book_id)
    if not book.pdf_key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No PDF available for this book")
    if not book.download_allowed:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Download not permitted for this book")
    if not s3_service.s3_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE,
                            "S3 is not configured. PDF download requires S3 access.")
    book.download_count = (book.download_count or 0) + 1
    _log_activity(session, book.school_id, book.book_id, user["user_id"], "download")
    session.commit()
    return {"url": s3_service.presign_get(book.pdf_key)}


@router.get("/books/{book_id}/cover")
def cover_image(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    book = _get_book_or_404(session, school_id, book_id)
    if not book.cover_key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No cover image for this book")
    if not s3_service.s3_configured():
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE,
                            "S3 is not configured. Cover image requires S3 access.")
    return {"url": s3_service.presign_get(book.cover_key)}


# ------------------------------------------------------------------ categories (all: read; admin: write)
@router.get("/categories")
def list_categories(scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    cats = scope_query(session.query(BookCategory), BookCategory, school_id).all()
    return [_category_dict(c) for c in cats]


class CategoryIn(BaseModel):
    name: str
    description: str | None = None


@router.post("/categories")
def create_category(body: CategoryIn, scope=Depends(get_scoped_db),
                    user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    cat = BookCategory(school_id=school_id, **body.model_dump())
    session.add(cat)
    session.commit()
    return _category_dict(cat)


@router.put("/categories/{category_id}")
def update_category(category_id: int, body: CategoryIn, scope=Depends(get_scoped_db),
                    user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    cat = (scope_query(session.query(BookCategory), BookCategory, school_id)
           .filter(BookCategory.category_id == category_id).first())
    if not cat:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
    cat.name = body.name
    cat.description = body.description
    cat.updated_at = datetime.utcnow()
    session.commit()
    return _category_dict(cat)


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, scope=Depends(get_scoped_db),
                    user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    cat = (scope_query(session.query(BookCategory), BookCategory, school_id)
           .filter(BookCategory.category_id == category_id).first())
    if not cat:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Category not found")
    session.delete(cat)
    session.commit()
    return {"category_id": category_id, "deleted": True}


# ------------------------------------------------------------------ admin: book CRUD + upload
class BookIn(BaseModel):
    title: str
    author: str | None = None
    publisher: str | None = None
    category_id: int | None = None
    class_level: str | None = None
    language: str | None = None
    keywords: str | None = None      # comma-separated; stored as TEXT
    cover_key: str | None = None
    pdf_key: str | None = None
    download_allowed: bool = False
    status: str = "Active"


@router.post("/books")
def create_book(body: BookIn, scope=Depends(get_scoped_db),
                user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    book = Book(school_id=school_id, **body.model_dump())
    session.add(book)
    session.commit()
    return _book_dict(book)


@router.put("/books/{book_id}")
def update_book(book_id: int, body: BookIn, scope=Depends(get_scoped_db),
                user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    book = _get_book_or_404(session, school_id, book_id)
    for k, v in body.model_dump().items():
        setattr(book, k, v)
    book.updated_at = datetime.utcnow()
    session.commit()
    return _book_dict(book)


@router.delete("/books/{book_id}")
def deactivate_book(book_id: int, scope=Depends(get_scoped_db),
                    user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    book = _get_book_or_404(session, school_id, book_id)
    book.status = "Inactive"
    session.commit()
    return {"book_id": book.book_id, "status": book.status}


@router.post("/books/upload")
async def upload_book_file(
    file: UploadFile = File(...),
    file_type: str = Query("pdf", description="'pdf' or 'cover'"),
    book_id: int | None = Query(None),
    scope=Depends(get_scoped_db),
    user: dict = Depends(require_role(*ADMIN_ROLES)),
):
    """Upload a PDF or cover image to S3. Returns the S3 key to store on the book record."""
    if not s3_service.s3_configured():
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "S3 is not configured. File upload will be available once S3 access is configured.",
        )
    session, school_id = scope
    branch = user["branch"]
    slug = f"{book_id or 'new'}_{file.filename}"
    key = s3_service.build_key(branch, school_id, "granthalaya", file_type, slug)
    content_type = file.content_type or (
        "application/pdf" if file_type == "pdf" else "image/jpeg"
    )
    s3_service.upload_fileobj(file.file, key, content_type)
    return {"key": key, "file_type": file_type}


# ------------------------------------------------------------------ teacher: book request
class BookRequestIn(BaseModel):
    title: str
    author: str | None = None
    reason: str | None = None


@router.post("/requests")
def request_book(body: BookRequestIn, scope=Depends(get_scoped_db),
                 user: dict = Depends(require_role(*TEACHER_ROLES))):
    session, school_id = scope
    req = BookRequest(school_id=school_id, requested_by=user["user_id"],
                      title=body.title, author=body.author, reason=body.reason)
    session.add(req)
    session.commit()
    return _request_dict(req)


@router.get("/requests/mine")
def my_requests(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*TEACHER_ROLES))):
    session, school_id = scope
    reqs = (scope_query(session.query(BookRequest), BookRequest, school_id)
            .filter(BookRequest.requested_by == user["user_id"])
            .order_by(BookRequest.created_at.desc()).all())
    return [_request_dict(r) for r in reqs]


# ------------------------------------------------------------------ teacher: content report
class ContentReportIn(BaseModel):
    book_id: int
    reason_category: str | None = None
    reason: str


@router.post("/reports")
def report_content(body: ContentReportIn, scope=Depends(get_scoped_db),
                   user: dict = Depends(require_role(*TEACHER_ROLES))):
    session, school_id = scope
    rep = ContentReport(
        school_id=school_id,
        book_id=body.book_id,
        reported_by=user["user_id"],
        reason_category=body.reason_category,
        reason=body.reason,
    )
    session.add(rep)
    session.commit()
    return _report_dict(rep)


# ------------------------------------------------------------------ admin: approve requests
@router.get("/requests")
def all_requests(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    reqs = (scope_query(session.query(BookRequest), BookRequest, school_id)
            .order_by(BookRequest.created_at.desc()).all())
    return [_request_dict(r, _teacher_name(session, r.requested_by)) for r in reqs]


@router.post("/requests/{request_id}/{decision}")
def review_request(request_id: int, decision: str, scope=Depends(get_scoped_db),
                   user: dict = Depends(require_role(*ADMIN_ROLES))):
    if decision not in ("approve", "reject"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "decision must be approve|reject")
    session, school_id = scope
    req = (scope_query(session.query(BookRequest), BookRequest, school_id)
           .filter(BookRequest.request_id == request_id).first())
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    req.status = "approved" if decision == "approve" else "rejected"
    req.reviewed_by = user["user_id"]
    req.reviewed_at = datetime.utcnow()
    _notify(session, school_id, req.requested_by, "Acharya",
            f"request_{req.status}",
            f"Your book request '{req.title}' was {req.status}.")
    session.commit()
    return _request_dict(req, _teacher_name(session, req.requested_by))


# ------------------------------------------------------------------ admin: resolve reports
@router.get("/reports")
def all_reports(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    reps = (scope_query(session.query(ContentReport), ContentReport, school_id)
            .order_by(ContentReport.created_at.desc()).all())
    result = []
    for r in reps:
        book = session.query(Book).filter(Book.book_id == r.book_id).first()
        result.append(_report_dict(
            r,
            book_title=book.title if book else None,
            reporter_name=_teacher_name(session, r.reported_by),
        ))
    return result


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, scope=Depends(get_scoped_db),
                   user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    rep = (scope_query(session.query(ContentReport), ContentReport, school_id)
           .filter(ContentReport.report_id == report_id).first())
    if not rep:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")
    rep.status = "resolved"
    rep.resolved_by = user["user_id"]
    rep.resolved_at = datetime.utcnow()
    book = session.query(Book).filter(Book.book_id == rep.book_id).first()
    _notify(session, school_id, rep.reported_by, "Acharya",
            "report_resolved",
            "Your content report has been reviewed and resolved.")
    session.commit()
    return _report_dict(
        rep,
        book_title=book.title if book else None,
        reporter_name=_teacher_name(session, rep.reported_by),
    )


# ------------------------------------------------------------------ admin: stats
@router.get("/stats")
def stats(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    books_q = scope_query(session.query(Book), Book, school_id)
    most_viewed     = books_q.order_by(Book.view_count.desc()).limit(5).all()
    most_downloaded = books_q.order_by(Book.download_count.desc()).limit(5).all()
    total_views     = sum(b.view_count or 0 for b in books_q.all())
    total_downloads = sum(b.download_count or 0 for b in books_q.all())
    return {
        "total_books": books_q.count(),
        "total_views": total_views,
        "total_downloads": total_downloads,
        "pending_requests": (scope_query(session.query(BookRequest), BookRequest, school_id)
                             .filter(BookRequest.status == "pending").count()),
        "open_reports": (scope_query(session.query(ContentReport), ContentReport, school_id)
                         .filter(ContentReport.status == "open").count()),
        "most_viewed": [
            {"book_id": b.book_id, "title": b.title, "views": b.view_count or 0}
            for b in most_viewed
        ],
        "most_downloaded": [
            {"book_id": b.book_id, "title": b.title, "downloads": b.download_count or 0}
            for b in most_downloaded
        ],
    }


# ------------------------------------------------------------------ notifications (all roles)
@router.get("/notifications")
def notifications(scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    notifs = (scope_query(session.query(Notification), Notification, school_id)
              .filter(Notification.user_id == user["user_id"],
                      Notification.user_role == user["role"])
              .order_by(Notification.created_at.desc()).all())
    return [_notification_dict(n) for n in notifs]


@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, scope=Depends(get_scoped_db),
                            user: dict = Depends(get_current_user)):
    session, school_id = scope
    notif = (scope_query(session.query(Notification), Notification, school_id)
             .filter(Notification.notification_id == notification_id,
                     Notification.user_id == user["user_id"],
                     Notification.user_role == user["role"]).first())
    if not notif:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found")
    notif.is_read = True
    session.commit()
    return _notification_dict(notif)


@router.patch("/notifications/read-all")
def mark_all_notifications_read(scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    (scope_query(session.query(Notification), Notification, school_id)
     .filter(Notification.user_id == user["user_id"],
             Notification.user_role == user["role"],
             Notification.is_read == False)  # noqa: E712
     .update({"is_read": True}, synchronize_session=False))
    session.commit()
    return {"marked_read": True}
