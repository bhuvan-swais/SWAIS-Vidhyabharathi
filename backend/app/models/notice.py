from sqlalchemy import Column, BigInteger, String, Text, Date, DateTime, Integer, ForeignKey
from app.db.session import Base

class VbNoticeBoard(Base):
    __tablename__ = "vb_notice_board"

    notice_id         = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # REMOVED: school_id (Does not exist in the database)
    
    notice_title      = Column(String(200), nullable=True)
    notice_text       = Column(Text, nullable=True)
    notice_date       = Column(Date, nullable=True)
    applicable_class  = Column(String(50), nullable=True)
    
    # ADDED: ForeignKey mapping to users table
    posted_by         = Column(BigInteger, ForeignKey("vb_users_master.user_id"), nullable=True)
    
    # ADDED: Missing columns from the database schema
    created_datetime  = Column(DateTime, nullable=True)
    modified_datetime = Column(DateTime, nullable=True)
    record_status     = Column(String, nullable=True)
    version_no        = Column(Integer, nullable=True)
    applicable_to     = Column(String(255), nullable=True)