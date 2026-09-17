import enum
from sqlalchemy import Column, BigInteger, Integer, String, Numeric, ForeignKey, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from app.db.session import Base

class AssessmentType(str, enum.Enum):
    quiz       = "quiz"
    test       = "test"
    exam       = "exam"
    assignment = "assignment"

class VbAssessment(Base):
    __tablename__ = "vb_assessments"

    assessment_id   = Column(BigInteger, primary_key=True)
    # FIXED: References vb_teacher_master.teacher_id
    teacher_id      = Column(BigInteger, ForeignKey("vb_teacher_master.teacher_id", ondelete="CASCADE"), nullable=False, index=True)
    
    title           = Column(String(300), nullable=True)
    assessment_type = Column(String(50),  nullable=False, default="test") 
    chapter_id      = Column(BigInteger, ForeignKey("vb_chapter_master.chapter_id"), nullable=True)
    chapter         = Column(String(300), nullable=True)
    assessment_date = Column(Date,        nullable=True)
    max_marks       = Column(Numeric(6, 2), nullable=True)
    class_name      = Column(String(10),  nullable=False)
    section         = Column(String(5),   nullable=False)
    total_students  = Column(Integer,     nullable=True)
    submitted       = Column(Integer,     nullable=True)
    class_average   = Column(Numeric(5, 2), nullable=True)
    created_at      = Column(DateTime,    nullable=True)
    updated_at      = Column(DateTime,    nullable=True)
    record_status   = Column(String(20),  nullable=True)
    version_no      = Column(Integer,     nullable=True)

    acharya = relationship("VbAcharya", back_populates="assessments")
    results = relationship("VbAssessmentResult", back_populates="assessment", cascade="all, delete-orphan")

class VbAssessmentResult(Base):
    __tablename__ = "vb_assessment_results"

    result_id      = Column(BigInteger, primary_key=True)
    assessment_id  = Column(BigInteger, ForeignKey("vb_assessments.assessment_id", ondelete="CASCADE"), nullable=False, index=True)
    student_id     = Column(BigInteger, ForeignKey("vb_student_master.student_id", ondelete="CASCADE"), nullable=False, index=True)
    
    roll_number    = Column(String(20),  nullable=False)
    student_name   = Column(String(150), nullable=True)
    marks_obtained = Column(Numeric(6, 2), nullable=True)
    percentage     = Column(Numeric(5, 2), nullable=True)
    is_absent      = Column(Boolean,     nullable=False, default=False)
    created_at     = Column(DateTime,    nullable=True)
    updated_at     = Column(DateTime,    nullable=True)
    record_status  = Column(String(20),  nullable=True)
    version_no     = Column(Integer,     nullable=True)

    assessment = relationship("VbAssessment", back_populates="results")
    student    = relationship("VbStudent", back_populates="results")