from sqlalchemy import Column, BigInteger, String, Integer, DateTime, ForeignKey
from app.db.session import Base

class VbClassMaster(Base):
    __tablename__ = "vb_class_master"

    class_id          = Column(BigInteger, primary_key=True, autoincrement=True)
    school_id         = Column(BigInteger, nullable=True, index=True)
    class_name        = Column(String, nullable=True)
    section_name      = Column(String, nullable=True)
    
    # ADDED: New columns from the database schema
    academic_year     = Column(String, nullable=True)
    
    # ADDED: Foreign key constraint mapping to vb_users_master
    class_teacher_id  = Column(BigInteger, ForeignKey("vb_users_master.user_id"), nullable=True)
    
    # ADDED: Tracking and metadata columns
    created_datetime  = Column(DateTime, nullable=True)
    modified_datetime = Column(DateTime, nullable=True)
    record_status     = Column(String, nullable=True)
    version_no        = Column(Integer, nullable=True)