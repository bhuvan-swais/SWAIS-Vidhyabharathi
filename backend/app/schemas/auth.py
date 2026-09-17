from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SSOTokenRequest(BaseModel):
    email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    teacher_id: str
    
    # FIXED: Made optional. Since school_id was removed from the DB models, 
    # the backend auth route must pass None or a hardcoded default (e.g., 1) here.
    school_id: int | None = None 
    
    name: str
    email: str
    subject: str | None = None
    class_assigned: str | None = None
    section: str | None = None
    avatar_initials: str | None = None
    school_name: str | None = None
    total_students: int | None = None

class MeResponse(BaseModel):
    teacher_id: str
    
    # FIXED: Made optional to prevent Pydantic validation crashes.
    school_id: int | None = None 
    
    name: str
    email: str
    subject: str | None = None
    class_assigned: str | None = None
    section: str | None = None
    avatar_initials: str | None = None
    school_name: str | None = None
    total_students: int | None = None