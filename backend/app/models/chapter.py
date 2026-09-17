from sqlalchemy import BigInteger, Boolean, Column, Integer, Text, DateTime, String
from app.db.session import Base

class VbChapterContent(Base):
    __tablename__ = "vb_chapter_content"

    chapter_content_id  = Column(BigInteger, primary_key=True, autoincrement=True)
    chapter_id          = Column(BigInteger, nullable=True, index=True)
    content_title       = Column(String(300), nullable=True)
    full_text_content   = Column(Text, nullable=True)
    
    # ADDED: Metadata columns from the database schema
    content_format      = Column(String(50), nullable=True)
    language_code       = Column(String(20), nullable=True)
    version_label       = Column(String(50), nullable=True)
    
    is_active           = Column(Boolean, default=True)
    
    # ADDED: Tracking columns from the database schema
    created_datetime    = Column(DateTime, nullable=True)
    created_user_id     = Column(String(50), nullable=True)
    created_ip_address  = Column(String(50), nullable=True)
    modified_datetime   = Column(DateTime, nullable=True)
    modified_user_id    = Column(String(50), nullable=True)
    modified_ip_address = Column(String(50), nullable=True)
    
    record_status       = Column(String(20), nullable=True, default="Active")
    version_no          = Column(Integer, nullable=True, default=1)

    # REMOVED: school_id (Does not exist in DB)
    # REMOVED: chapter_name (Does not exist in DB)