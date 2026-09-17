from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.session import Base

class VbUser(Base):
    __tablename__ = "vb_users_masters"

    # FIXED: Type is 'integer', not 'bigint'
    user_id       = Column(Integer, primary_key=True, autoincrement=True)
    
    # FIXED: Renamed from login_id to username
    username      = Column(String(100), unique=True, nullable=False, index=True)
    
    # FIXED: Renamed from email_id to email, added unique constraint mapping
    email         = Column(String(255), unique=True, nullable=False, index=True)
    
    password_hash = Column(String(255), nullable=False)
    
    # FIXED: Replaced role_id with role (mapped as String to handle PG custom 'userrole' type)
    role          = Column(String, nullable=False)
    
    is_active     = Column(Boolean, default=True)
    
    # FIXED: Renamed from created_datetime and added updated_at with timezone support
    created_at    = Column(DateTime(timezone=True), nullable=True)
    updated_at    = Column(DateTime(timezone=True), nullable=True)

    # REMOVED: full_name, first_name, mobile_no, role_id, school_id, 
    # record_status, version_no (These DO NOT exist in the database schema)