"""Shared org/user models — SWAIS VidhyaBharathi (DEMO branch → dem_prod).

Tables used by MORE THAN ONE module (admin, pradhana, vidyarthi) live here so a
table is mapped exactly ONCE (SQLAlchemy errors on duplicate __tablename__).
Types match the live dem_prod schema. Plain Base (demo tables lack a direct
school_id except where noted).
"""
from sqlalchemy import Column, BigInteger, Integer, String, Boolean, Text, DateTime

from app.db.session import Base


class UserMaster(Base):
    __tablename__ = "dem_users_master"
    user_id       = Column(BigInteger, primary_key=True)
    login_id      = Column(String(100), nullable=True)
    password_hash = Column(Text, nullable=True)
    full_name     = Column(String(150), nullable=False)
    email_id      = Column(String(150), nullable=True, index=True)
    mobile_no     = Column(String(20), nullable=True)
    role_id       = Column(BigInteger, nullable=True)
    school_id     = Column(BigInteger, nullable=True, index=True)  # this table HAS school_id
    is_active     = Column(Boolean, nullable=True)
    role          = Column(String(50), nullable=True)
    record_status = Column(String(20), nullable=True)


class StudentMaster(Base):
    __tablename__ = "dem_student_master"
    student_id     = Column(BigInteger, primary_key=True)
    admission_no   = Column(String, nullable=True)
    full_name      = Column(String, nullable=True)
    class_id       = Column(BigInteger, nullable=True, index=True)
    section        = Column(String, nullable=True)
    roll_no        = Column(String, nullable=True)
    mobile_no      = Column(String, nullable=True)
    email_id       = Column(String, nullable=True, index=True)
    guardian_name  = Column(String, nullable=True)
    guardian_phone = Column(String, nullable=True)
    guardian_email = Column(String, nullable=True)
    parent_name    = Column(String, nullable=True)
    parent_phone   = Column(String, nullable=True)
    parent_email   = Column(String, nullable=True)
    is_active      = Column(Boolean, nullable=True)
    record_status  = Column(String, nullable=True)


class TeacherMaster(Base):
    __tablename__ = "dem_teacher_master"
    teacher_id   = Column(BigInteger, primary_key=True)
    full_name    = Column(String, nullable=True)
    email_id     = Column(String, nullable=True, index=True)
    phone        = Column(BigInteger, nullable=True)   # NOTE: bigint in demo, not varchar
    subject_name = Column(String, nullable=True)
    class_id     = Column(BigInteger, nullable=True)
    section_1    = Column(String, nullable=True)
    section_2    = Column(String, nullable=True)
    role         = Column(String, nullable=True)
    is_active    = Column(Boolean, nullable=True)


class SchoolMaster(Base):
    __tablename__ = "dem_school_master"
    school_id      = Column(BigInteger, primary_key=True)
    school_name    = Column(String(200), nullable=False)
    city           = Column(String(100), nullable=True)
    state          = Column(String(100), nullable=True)
    contact_person = Column(String(150), nullable=True)
    mobile_no      = Column(String(20), nullable=True)
    email_id       = Column(String(150), nullable=True)
    record_status  = Column(String(20), nullable=True)


class ClassMaster(Base):
    __tablename__ = "dem_class_master"
    class_id         = Column(BigInteger, primary_key=True)
    school_id        = Column(BigInteger, nullable=True, index=True)  # HAS school_id
    class_name       = Column(String, nullable=True)
    section_name     = Column(String, nullable=True)
    academic_year    = Column(String, nullable=True)
    class_teacher_id = Column(BigInteger, nullable=True)
    record_status    = Column(String, nullable=True)


class SubjectMaster(Base):
    __tablename__ = "dem_subject_master"
    subject_id    = Column(BigInteger, primary_key=True)
    class_id      = Column(BigInteger, nullable=True, index=True)
    subject_name  = Column(String, nullable=True)
    subject_code  = Column(String, nullable=True)
    teacher_id    = Column(BigInteger, nullable=True)
    record_status = Column(String, nullable=True)


class NoticeBoard(Base):
    __tablename__ = "dem_notice_board"
    notice_id        = Column(BigInteger, primary_key=True)
    notice_title     = Column(String(200), nullable=True)
    notice_text      = Column(Text, nullable=True)
    notice_date      = Column(DateTime, nullable=True)
    applicable_class = Column(String(50), nullable=True)
    applicable_to    = Column(String(255), nullable=True)
    posted_by        = Column(BigInteger, nullable=True)
    record_status    = Column(String, nullable=True)
