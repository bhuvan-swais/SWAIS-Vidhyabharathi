from sqlalchemy import Column, BigInteger, String, Integer, DateTime, ForeignKey
from app.db.session import Base

class VbSubjectMaster(Base):
    __tablename__ = "vb_subject_master"

    subject_id        = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # REMOVED: school_id (Does not exist in the database)
    
    # ADDED: ForeignKey mapping to vb_class_master
    class_id          = Column(BigInteger, ForeignKey("vb_class_master.class_id"), nullable=True, index=True)
    
    subject_name      = Column(String, nullable=True)
    subject_code      = Column(String, nullable=True)
    
    # ADDED: ForeignKey mapping to vb_users_master
    teacher_id        = Column(BigInteger, ForeignKey("vb_users_master.user_id"), nullable=True, index=True)
    
    # ADDED: Tracking columns from the database schema
    created_datetime  = Column(DateTime, nullable=True)
    modified_datetime = Column(DateTime, nullable=True)
    record_status     = Column(String, nullable=True)
    version_no        = Column(Integer, nullable=True)