from sqlalchemy import Column, BigInteger, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class VbStudent(Base):
    __tablename__ = "vb_student_master"

    student_id      = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # REMOVED: school_id (Does not exist in the database)
    
    admission_no    = Column(String, nullable=True)
    full_name       = Column(String, nullable=True)
    
    # ADDED: ForeignKey mapping based on the DB constraints
    class_id        = Column(BigInteger, ForeignKey("vb_class_master.class_id"), nullable=True)
    
    section         = Column(String, nullable=True)
    roll_no         = Column(String, nullable=True)
    
    # FIXED: Replaced student_phone and student_email with exact DB column names
    mobile_no       = Column(String, nullable=True)
    email_id        = Column(String, nullable=True, unique=True, index=True)
    
    guardian_name   = Column(String, nullable=True)
    guardian_phone  = Column(String, nullable=True)
    guardian_email  = Column(String, nullable=True)
    is_active       = Column(Boolean, nullable=True)
    
    # FIXED: Tracking columns mapping exactly to the database
    created_at      = Column(DateTime, nullable=True)
    updated_at      = Column(DateTime, nullable=True)
    record_status   = Column(String, nullable=True)
    version_no      = Column(Integer, nullable=True)
    
    # ADDED: Missing parent columns from the database schema
    parent_name     = Column(String(255), nullable=True)
    parent_phone    = Column(String(50), nullable=True)
    parent_email    = Column(String(255), nullable=True)
    created_datetime = Column(DateTime, nullable=True)
    
    # ADDED: Missing specific father/mother metadata from the database schema
    fatherName      = Column(String(255), nullable=True)
    fatherPhone     = Column(String(50), nullable=True)
    fatherEmail     = Column(String(255), nullable=True)
    fatherPhoto     = Column(Text, nullable=True)
    
    motherName      = Column(String(255), nullable=True)
    motherPhone     = Column(String(50), nullable=True)
    motherEmail     = Column(String(255), nullable=True)
    motherPhoto     = Column(Text, nullable=True)
    
    father_photo_url = Column(Text, nullable=True)
    mother_photo_url = Column(Text, nullable=True)

    results = relationship("VbAssessmentResult", back_populates="student", cascade="all, delete-orphan")