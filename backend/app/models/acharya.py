"""
VbAcharya — Teacher profile data.
Maps to vb_teacher_master table.
"""

from sqlalchemy import Column, BigInteger, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.db.session import Base

class VbAcharya(Base):
    __tablename__ = "vb_teacher_master"

    # Updated to match the actual database primary key: teacher_id
    id           = Column("teacher_id", BigInteger, primary_key=True, autoincrement=True)
    
    # ⚠️ WARNING: user_id and school_id are commented out because they DO NOT exist 
    # in the vb_teacher_master schema according to your PostgreSQL output.
    # user_id    = Column(BigInteger, ForeignKey("vb_users_master.user_id"), nullable=False, index=True)
    # school_id  = Column(BigInteger, nullable=False, index=True)
    
    full_name    = Column(String(255), nullable=True)
    email_id     = Column(String(255), nullable=True, unique=True, index=True)
    phone        = Column(BigInteger, nullable=True)
    subject_name = Column(String(255), nullable=True)
    class_id     = Column(BigInteger, nullable=True)
    section_1    = Column(String(50), nullable=True)
    section_2    = Column(String(50), nullable=True)
    role         = Column(String(50), nullable=True)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime, nullable=True)

    # Relationships updated to match new class names
    # user        = relationship("VbUser") # Commented out due to missing user_id
    notes       = relationship("VbNote", back_populates="acharya", cascade="all, delete-orphan")
    assessments = relationship("VbAssessment", back_populates="acharya", cascade="all, delete-orphan")