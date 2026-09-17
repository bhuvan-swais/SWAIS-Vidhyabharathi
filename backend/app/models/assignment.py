from sqlalchemy import Column, BigInteger, Integer, String, Text, Date, DateTime, ForeignKey
from app.db.session import Base

class VbAssignmentMaster(Base):
    __tablename__ = "vb_assignment_master"

    assignment_id       = Column(BigInteger, primary_key=True)
    chapter_id          = Column(BigInteger, ForeignKey("vb_chapter_master.chapter_id"), nullable=True)
    assignment_title    = Column(String(200), nullable=True)
    assignment_text     = Column(Text, nullable=True)
    due_date            = Column(Date, nullable=True)
    assigned_by         = Column(BigInteger, ForeignKey("vb_users_master.user_id"), nullable=True)
    
    # Columns added based on your PostgreSQL schema
    created_datetime    = Column(DateTime, nullable=True)
    created_user_id     = Column(BigInteger, nullable=True)
    modified_user_id    = Column(BigInteger, nullable=True)
    modified_datetime   = Column(DateTime, nullable=True)
    modified_ip_address = Column(String, nullable=True)
    record_status       = Column(String(20), nullable=True)
    version_no          = Column(Integer, nullable=True)

    # REMOVED: school_id, class_id, and subject_id as they do not exist in the DB.

class VbAssignmentResult(Base):
    __tablename__ = "vb_assignment_results"

    assignment_result_id = Column(BigInteger, primary_key=True)
    assignment_id        = Column(BigInteger, nullable=True)
    school_id            = Column(BigInteger, nullable=False, index=True)
    student_id           = Column(BigInteger, nullable=False)
    status               = Column(String(50), nullable=True)
    submitted_at         = Column(DateTime, nullable=True)