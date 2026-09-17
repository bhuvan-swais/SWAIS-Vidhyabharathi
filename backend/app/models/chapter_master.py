from sqlalchemy import BigInteger, Column, Integer, String, Text, DateTime, ForeignKey
from app.db.session import Base

class VbChapterMaster(Base):
    __tablename__ = "vb_chapter_master"

    chapter_id          = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # ADDED ForeignKey mapping based on the DB constraints
    subject_id          = Column(BigInteger, ForeignKey("vb_subject_master.subject_id"), nullable=True, index=True)
    
    chapter_no          = Column(Integer,    nullable=True)
    chapter_name        = Column(String,     nullable=True)
    chapter_description = Column(Text,       nullable=True)
    chapter_order       = Column(Integer,    nullable=True)
    
    # ADDED: Tracking columns found in the PostgreSQL schema
    created_datetime    = Column(DateTime,   nullable=True)
    created_user_id     = Column(String,     nullable=True) # DB type is character varying
    modified_datetime   = Column(DateTime,   nullable=True)
    
    record_status       = Column(String,     nullable=True)
    version_no          = Column(Integer,    nullable=True)

    # REMOVED: school_id (Does not exist in DB)
    # REMOVED: book_volume_number (Does not exist in DB)