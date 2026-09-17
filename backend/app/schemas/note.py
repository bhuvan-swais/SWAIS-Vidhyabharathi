from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class NoteCreate(BaseModel):
    class_id: Optional[int] = None
    section_1: Optional[str] = None
    notes: Optional[str] = None

class NoteUpdate(BaseModel):
    class_id: Optional[int] = None
    section_1: Optional[str] = None
    notes: Optional[str] = None

class NoteOut(BaseModel):
    # Map the DB notes_id to 'id' for the frontend
    id: int = Field(alias="notes_id") 
    
    class_id: Optional[int] = None
    section_1: Optional[str] = None
    
    # Since title and chapter don't exist in DB, we map the raw notes content here
    notes: Optional[str] = None
    
    created_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "populate_by_name": True # Allows Pydantic to use the alias mapping
    }

class NoteListResponse(BaseModel):
    notes: List[NoteOut]
    total: int