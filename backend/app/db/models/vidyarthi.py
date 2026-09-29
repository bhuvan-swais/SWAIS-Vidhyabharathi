"""Vidyarthi (student) models — SWAIS VidhyaBharathi.

Mapped to the DEMO branch database (vb_prod). Column names + types match the
LIVE vb_prod schema exactly (verified from information_schema) — this is what
prevents the sss_faculty type-mismatch outage.

NOTE: these demo tables have NO direct `school_id` column (the demo is one
school, scoped via class_id -> class_master.school_id), so they inherit the
plain Base, NOT TenantModel. Real BVK branches will add direct school_id.
"""
from sqlalchemy import (
    Column, BigInteger, Integer, String, Text, Boolean, Numeric, Date, DateTime,
)
from sqlalchemy.dialects.postgresql import JSONB

from app.db.session import Base
# StudentMaster + SubjectMaster are shared (admin/pradhana too) → defined once in common.py
from app.db.models.common import StudentMaster, SubjectMaster  # noqa: F401 (re-exported)


class ChapterContent(Base):
    __tablename__ = "vb_chapter_content"
    chapter_content_id = Column(BigInteger, primary_key=True)
    chapter_id         = Column(BigInteger, nullable=True, index=True)
    content_title      = Column(String(300), nullable=True)
    full_text_content  = Column(Text, nullable=True)
    content_format     = Column(String(50), nullable=True)
    language_code      = Column(String(20), nullable=True)
    is_active          = Column(Boolean, nullable=True)
    record_status      = Column(String(20), nullable=True)


class StudentLearningProfile(Base):
    __tablename__ = "vb_student_learning_profiles"
    id                   = Column(Integer, primary_key=True)   # NOTE: integer here, not bigint
    student_id           = Column(Integer, nullable=False, index=True)
    chapter_id           = Column(Integer, nullable=False)
    chapter_title        = Column(String(160), nullable=False)
    reading_time_minutes = Column(Integer, nullable=False)
    quiz_score           = Column(Integer, nullable=False)
    retry_count          = Column(Integer, nullable=False)
    comprehension_score  = Column(Integer, nullable=False)
    reader_classification = Column(String(50), nullable=False)
    generated_path       = Column(JSONB, nullable=False)
    created_at           = Column(DateTime, nullable=True)
    updated_at           = Column(DateTime, nullable=True)


class AssignmentMaster(Base):
    __tablename__ = "vb_assignment_master"
    assignment_id    = Column(BigInteger, primary_key=True)
    chapter_id       = Column(BigInteger, nullable=True)
    assignment_title = Column(String, nullable=True)
    assignment_text  = Column(Text, nullable=True)
    due_date         = Column(Date, nullable=True)
    assigned_by      = Column(BigInteger, nullable=True)
    record_status    = Column(String, nullable=True)


class StudentSubmission(Base):
    __tablename__ = "vb_student_submission"
    submission_id   = Column(BigInteger, primary_key=True)
    assignment_id   = Column(BigInteger, nullable=True, index=True)
    student_id      = Column(BigInteger, nullable=True, index=True)
    submission_text = Column(Text, nullable=True)
    file_path       = Column(Text, nullable=True)
    marks_obtained  = Column(Numeric, nullable=True)
    teacher_remarks = Column(Text, nullable=True)
    submitted_at    = Column(DateTime, nullable=True)
    record_status   = Column(String, nullable=True)


class AssessmentResult(Base):
    __tablename__ = "vb_assessment_results"
    result_id      = Column(BigInteger, primary_key=True)
    assessment_id  = Column(BigInteger, nullable=True, index=True)
    student_id     = Column(BigInteger, nullable=True, index=True)
    roll_number    = Column(String(20), nullable=False)
    student_name   = Column(String(150), nullable=True)
    marks_obtained = Column(Numeric, nullable=True)
    percentage     = Column(Numeric, nullable=True)
    is_absent      = Column(Boolean, nullable=False)
    record_status  = Column(String(20), nullable=True)


class ChapterMaster(Base):
    __tablename__ = "vb_chapter_master"
    chapter_id          = Column(BigInteger, primary_key=True)
    subject_id          = Column(BigInteger, nullable=True, index=True)
    chapter_no          = Column(Integer, nullable=True)
    chapter_name        = Column(String, nullable=True)
    chapter_description = Column(Text, nullable=True)
    chapter_order       = Column(Integer, nullable=True)
    record_status       = Column(String, nullable=True)


class QuizMaster(Base):
    __tablename__ = "vb_quiz_master"
    quiz_id          = Column(BigInteger, primary_key=True)
    chapter_id       = Column(BigInteger, nullable=True, index=True)
    quiz_title       = Column(String, nullable=True)
    total_marks      = Column(Integer, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    record_status    = Column(String, nullable=True)


class QuizResponse(Base):
    __tablename__ = "vb_quiz_response"
    response_id      = Column(BigInteger, primary_key=True)
    quiz_id          = Column(BigInteger, nullable=True, index=True)
    student_id       = Column(BigInteger, nullable=True, index=True)
    score            = Column(Numeric, nullable=True)
    completed_flag   = Column(Boolean, nullable=True)
    created_datetime = Column(DateTime, nullable=True)
    record_status    = Column(String, nullable=True)


class StudentMarks(Base):
    __tablename__ = "vb_student_marks"
    marks_id       = Column(BigInteger, primary_key=True)
    student_id     = Column(BigInteger, nullable=True, index=True)
    exam_id        = Column(BigInteger, nullable=True, index=True)
    subject_id     = Column(BigInteger, nullable=True, index=True)
    marks_obtained = Column(Numeric, nullable=True)
    max_marks      = Column(Numeric, nullable=True)
    grade          = Column(String, nullable=True)
    remarks        = Column(Text, nullable=True)
    record_status  = Column(String, nullable=True)


class ExamMaster(Base):
    __tablename__ = "vb_exam_master"
    exam_id       = Column(BigInteger, primary_key=True)
    exam_name     = Column(String, nullable=True)
    academic_year = Column(String, nullable=True)
    exam_type     = Column(String, nullable=True)
    start_date    = Column(Date, nullable=True)
    end_date      = Column(Date, nullable=True)
    record_status = Column(String, nullable=True)
