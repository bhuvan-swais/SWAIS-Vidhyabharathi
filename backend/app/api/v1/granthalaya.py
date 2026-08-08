"""Granthalaya (digital library) — SWAIS VidhyaBharathi.

RBAC:
  Vidyarthi (student) : view / search / read  (+ download if book.download_allowed)
  Acharya (teacher)   : + recommend/request a book, report content
  Admin               : full CRUD on books & categories, approve/reject requests,
                        resolve reports, view reports & statistics

Everything is school-scoped via get_scoped_db (branch DB + school_id).
Books' cover/PDF live in private S3; the reader/download return presigned URLs.
See docs/TENANCY.md and the models in db/models/granthalaya.py.
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.security import get_current_user, require_role
from app.core.scoping import get_scoped_db, scope_query
from app.services import s3_service
from app.db.models.granthalaya import (
    Book, BookCategory, BookRequest, ContentReport, ReadingActivity, Notification,
)

router = APIRouter(prefix="/granthalaya", tags=["granthalaya"])

# Role groups (Sanskrit role names from the product doc)
ADMIN_ROLES = ("School Admin", "Pradhana Acharya")
TEACHER_ROLES = ("Acharya",)


# ----------------------------- helpers -----------------------------
def _log_activity(session, school_id, book_id, user_id, action):
    session.add(ReadingActivity(
        school_id=school_id, book_id=book_id, user_id=user_id, action=action,
    ))


def _notify(session, school_id, user_id, ntype, message):
    session.add(Notification(
        school_id=school_id, user_id=user_id, type=ntype, message=message,
    ))


# ----------------------------- browse (all roles) -----------------------------
@router.get("/books")
def list_books(
    scope=Depends(get_scoped_db),
    user: dict = Depends(get_current_user),
    q: str | None = Query(None, description="title/author/publisher/keywords"),
    category_id: int | None = None,
    class_level: str | None = None,
    language: str | None = None,
):
    """Listing with search + filters (title/author/publisher/category/class/language/keywords)."""
    session, school_id = scope
    query = scope_query(session.query(Book), Book, school_id).filter(Book.status == "Active")
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
    return query.order_by(Book.title).all()


@router.get("/books/{book_id}")
def book_details(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    book = scope_query(session.query(Book), Book, school_id).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    book.view_count = (book.view_count or 0) + 1
    _log_activity(session, book.school_id, book.book_id, user["user_id"], "view")
    session.commit()
    return book


@router.get("/books/{book_id}/read")
def read_book(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    """Return a short-lived presigned URL to read the PDF in the browser."""
    session, school_id = scope
    book = scope_query(session.query(Book), Book, school_id).filter(Book.book_id == book_id).first()
    if not book or not book.pdf_key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book PDF not available")
    _log_activity(session, book.school_id, book.book_id, user["user_id"], "read")
    session.commit()
    return {"url": s3_service.presign_get(book.pdf_key)}


@router.get("/books/{book_id}/download")
def download_book(book_id: int, scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    book = scope_query(session.query(Book), Book, school_id).filter(Book.book_id == book_id).first()
    if not book or not book.pdf_key:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book PDF not available")
    if not book.download_allowed:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Download not permitted for this book")
    book.download_count = (book.download_count or 0) + 1
    _log_activity(session, book.school_id, book.book_id, user["user_id"], "download")
    session.commit()
    return {"url": s3_service.presign_get(book.pdf_key)}


# ----------------------------- teacher: request + report -----------------------------
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
    return {"request_id": req.request_id, "status": req.status}


@router.get("/requests/mine")
def my_requests(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*TEACHER_ROLES))):
    session, school_id = scope
    return (scope_query(session.query(BookRequest), BookRequest, school_id)
            .filter(BookRequest.requested_by == user["user_id"])
            .order_by(BookRequest.created_at.desc()).all())


class ContentReportIn(BaseModel):
    book_id: int
    reason: str


@router.post("/reports")
def report_content(body: ContentReportIn, scope=Depends(get_scoped_db),
                   user: dict = Depends(require_role(*TEACHER_ROLES))):
    session, school_id = scope
    rep = ContentReport(school_id=school_id, book_id=body.book_id,
                        reported_by=user["user_id"], reason=body.reason)
    session.add(rep)
    session.commit()
    return {"report_id": rep.report_id, "status": rep.status}


# ----------------------------- admin: books & categories -----------------------------
class BookIn(BaseModel):
    title: str
    author: str | None = None
    publisher: str | None = None
    category_id: int | None = None
    class_level: str | None = None
    language: str | None = None
    keywords: str | None = None
    cover_key: str | None = None
    pdf_key: str | None = None
    download_allowed: bool = False


@router.post("/books")
def create_book(body: BookIn, scope=Depends(get_scoped_db),
                user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    book = Book(school_id=school_id, **body.model_dump())
    session.add(book)
    session.commit()
    return {"book_id": book.book_id}


@router.put("/books/{book_id}")
def update_book(book_id: int, body: BookIn, scope=Depends(get_scoped_db),
                user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    book = scope_query(session.query(Book), Book, school_id).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    for k, v in body.model_dump().items():
        setattr(book, k, v)
    session.commit()
    return {"book_id": book.book_id}


@router.delete("/books/{book_id}")
def delete_book(book_id: int, scope=Depends(get_scoped_db),
                user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    book = scope_query(session.query(Book), Book, school_id).filter(Book.book_id == book_id).first()
    if not book:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Book not found")
    book.status = "Inactive"   # soft delete
    session.commit()
    return {"book_id": book.book_id, "status": book.status}


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
    return {"category_id": cat.category_id}


@router.get("/categories")
def list_categories(scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    return scope_query(session.query(BookCategory), BookCategory, school_id).all()


# ----------------------------- admin: approve requests / resolve reports -----------------------------
@router.get("/requests")
def all_requests(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    return (scope_query(session.query(BookRequest), BookRequest, school_id)
            .order_by(BookRequest.created_at.desc()).all())


@router.post("/requests/{request_id}/{decision}")
def review_request(request_id: int, decision: str, scope=Depends(get_scoped_db),
                   user: dict = Depends(require_role(*ADMIN_ROLES))):
    if decision not in ("approve", "reject"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "decision must be approve|reject")
    session, school_id = scope
    req = scope_query(session.query(BookRequest), BookRequest, school_id).filter(
        BookRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")
    req.status = "approved" if decision == "approve" else "rejected"
    req.reviewed_by = user["user_id"]
    req.reviewed_at = datetime.utcnow()
    _notify(session, school_id, req.requested_by, f"request_{req.status}",
            f"Your book request '{req.title}' was {req.status}.")
    session.commit()
    return {"request_id": req.request_id, "status": req.status}


@router.get("/reports")
def all_reports(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    return (scope_query(session.query(ContentReport), ContentReport, school_id)
            .order_by(ContentReport.created_at.desc()).all())


@router.post("/reports/{report_id}/resolve")
def resolve_report(report_id: int, scope=Depends(get_scoped_db),
                   user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    rep = scope_query(session.query(ContentReport), ContentReport, school_id).filter(
        ContentReport.report_id == report_id).first()
    if not rep:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")
    rep.status = "resolved"
    rep.resolved_by = user["user_id"]
    rep.resolved_at = datetime.utcnow()
    _notify(session, school_id, rep.reported_by, "report_resolved",
            "Your content report has been resolved.")
    session.commit()
    return {"report_id": rep.report_id, "status": rep.status}


# ----------------------------- reports & statistics (admin) -----------------------------
@router.get("/stats")
def stats(scope=Depends(get_scoped_db), user: dict = Depends(require_role(*ADMIN_ROLES))):
    session, school_id = scope
    books = scope_query(session.query(Book), Book, school_id)
    most_viewed = books.order_by(Book.view_count.desc()).limit(5).all()
    most_downloaded = books.order_by(Book.download_count.desc()).limit(5).all()
    return {
        "total_books": books.count(),
        "pending_requests": scope_query(session.query(BookRequest), BookRequest, school_id)
            .filter(BookRequest.status == "pending").count(),
        "open_reports": scope_query(session.query(ContentReport), ContentReport, school_id)
            .filter(ContentReport.status == "open").count(),
        "most_viewed": [{"book_id": b.book_id, "title": b.title, "views": b.view_count} for b in most_viewed],
        "most_downloaded": [{"book_id": b.book_id, "title": b.title, "downloads": b.download_count} for b in most_downloaded],
    }


# ----------------------------- notifications (all roles) -----------------------------
@router.get("/notifications")
def notifications(scope=Depends(get_scoped_db), user: dict = Depends(get_current_user)):
    session, school_id = scope
    return (scope_query(session.query(Notification), Notification, school_id)
            .filter(Notification.user_id == user["user_id"])
            .order_by(Notification.created_at.desc()).all())
