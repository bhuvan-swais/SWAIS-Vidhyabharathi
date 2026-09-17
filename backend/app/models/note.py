from sqlalchemy import Column, BigInteger, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class VbNote(Base):
    __tablename__ = "vb_teacher_notes"

    notes_id   = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # FIXED: Maps correctly to teacher_id
    teacher_id = Column(BigInteger, ForeignKey("vb_teacher_master.teacher_id", ondelete="CASCADE"), nullable=False, index=True)
    
    # REMOVED: school_id (Does not exist in the database)
    
    class_id   = Column(BigInteger, nullable=True)
    section_1  = Column(String(20), nullable=True) # Updated to length 20 to match DB
    notes      = Column(String(350), nullable=True) # Updated to length 350 to match DB
    created_at = Column(DateTime, nullable=True)

    acharya = relationship("VbAcharya", back_populates="notes")