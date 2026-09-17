from sqlalchemy import BigInteger, Column, DateTime, Integer, String, Text
from app.db.session import Base

ENTITY_CHAPTER_STUDY_MATERIAL = "CHAPTER_STUDY_MATERIAL"
ENTITY_ASSIGNMENT_ATTACHMENT = "ASSIGNMENT_ATTACHMENT"

class VbFileStorageMetadata(Base):
    __tablename__ = "vb_file_repository" # ⚠️ FIXED: Matches actual database table

    file_id             = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # REMOVED: school_id (Does not exist in database)

    entity_type         = Column(String(100), nullable=True)
    entity_id           = Column(BigInteger, nullable=True)
    file_name           = Column(String(200), nullable=True)
    file_url            = Column(Text, nullable=True)
    uploaded_by         = Column(BigInteger, nullable=True)
    
    # ADDED/UPDATED: Tracking columns mapped to exact database types
    created_datetime    = Column(DateTime, nullable=True)
    created_user_id     = Column(String(50), nullable=True)
    created_ip_address  = Column(String(50), nullable=True)
    modified_datetime   = Column(DateTime, nullable=True)
    modified_user_id    = Column(String(50), nullable=True)
    modified_ip_address = Column(String(50), nullable=True)
    record_status       = Column(String(20), nullable=True, default="Active")
    version_no          = Column(Integer, nullable=True, default=1)

    # REMOVED: created_at, updated_at (Replaced by created_datetime / modified_datetime)