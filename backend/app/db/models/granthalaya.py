"""Granthalaya (digital library) models — SWAIS VidhyaBharathi.

Tables (vb_ prefix), all school-scoped via TenantModel.school_id:
  vb_book_category, vb_book, vb_book_request, vb_content_report,
  vb_reading_activity, vb_notification

Business rules (see docs):
  - RBAC: Vidyarthi view/search/read (+download if allowed); Acharya
    recommend/request/report; Admin full CRUD + approvals + categories + reports.
  - book-request:   Acharya request -> pending -> Admin approve/reject -> notify
  - content-report: flag -> open -> Admin resolve
  - per-book download_allowed flag; usage tracking (view/read/download)
  - cover + PDF stored in S3 (private; served via presigned URLs)
"""
from datetime import datetime

from sqlalchemy import (
    Column, BigInteger, String, Text, Boolean, Integer, DateTime, ForeignKey,
)

from app.db.session import TenantModel


class BookCategory(TenantModel):
    __tablename__ = "vb_book_category"
    category_id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Book(TenantModel):
    __tablename__ = "vb_book"
    book_id = Column(BigInteger, primary_key=True, autoincrement=True)
    category_id = Column(BigInteger, ForeignKey("vb_book_category.category_id"), nullable=True, index=True)
    title = Column(String(300), nullable=False, index=True)
    author = Column(String(200), nullable=True)
    publisher = Column(String(200), nullable=True)
    class_level = Column(String(50), nullable=True)      # which class it's for
    language = Column(String(50), nullable=True)
    keywords = Column(Text, nullable=True)               # comma-separated, for search
    cover_key = Column(String(500), nullable=True)       # S3 key (private)
    pdf_key = Column(String(500), nullable=True)         # S3 key (private)
    download_allowed = Column(Boolean, default=False)    # per-book download flag
    view_count = Column(Integer, default=0)
    download_count = Column(Integer, default=0)
    status = Column(String(20), default="Active")        # Active / Inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BookRequest(TenantModel):
    """Acharya recommends/requests a book -> Admin approves or rejects."""
    __tablename__ = "vb_book_request"
    request_id = Column(BigInteger, primary_key=True, autoincrement=True)
    requested_by = Column(BigInteger, nullable=False, index=True)   # acharya user_id
    title = Column(String(300), nullable=False)
    author = Column(String(200), nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="pending")                  # pending/approved/rejected
    reviewed_by = Column(BigInteger, nullable=True)                 # admin user_id
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ContentReport(TenantModel):
    """Acharya flags a book's content -> Admin resolves."""
    __tablename__ = "vb_content_report"
    report_id = Column(BigInteger, primary_key=True, autoincrement=True)
    book_id = Column(BigInteger, ForeignKey("vb_book.book_id"), nullable=False, index=True)
    reported_by = Column(BigInteger, nullable=False)               # acharya user_id
    reason_category = Column(String(100), nullable=True)           # e.g. "Factual Error", "Outdated Information"
    reason = Column(Text, nullable=False)
    status = Column(String(20), default="open")                    # open/resolved
    resolved_by = Column(BigInteger, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReadingActivity(TenantModel):
    """Usage log: drives counts + most-viewed/downloaded reports."""
    __tablename__ = "vb_reading_activity"
    activity_id = Column(BigInteger, primary_key=True, autoincrement=True)
    book_id = Column(BigInteger, ForeignKey("vb_book.book_id"), nullable=False, index=True)
    user_id = Column(BigInteger, nullable=False, index=True)
    action = Column(String(20), nullable=False)                    # view / read / download
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(TenantModel):
    __tablename__ = "vb_notification"
    notification_id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id   = Column(BigInteger, nullable=False, index=True)
    user_role = Column(String(50), nullable=True, index=True)      # Vidyarthi / Acharya / School Admin
    type = Column(String(50), nullable=True)                       # request_approved, report_resolved, ...
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
