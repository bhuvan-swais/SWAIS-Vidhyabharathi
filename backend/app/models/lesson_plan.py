from sqlalchemy import Column, BigInteger, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class VbLessonPlan(Base):
    __tablename__ = "vb_teacher_lesson_plans"

    lesson_plan_id   = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # FIXED: Foreign key mapped to teacher_id
    teacher_id       = Column(BigInteger, ForeignKey("vb_teacher_master.teacher_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # REMOVED: school_id (Does not exist in database schema)

    title            = Column(Text, nullable=False)
    chapter_text     = Column(Text, nullable=True)
    duration_minutes = Column(BigInteger, nullable=True)
    plan_data        = Column(Text, nullable=False) 
    created_at       = Column(DateTime, nullable=True)

    acharya = relationship("VbAcharya")