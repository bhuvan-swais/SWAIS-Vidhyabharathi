from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.acharya import VbAcharya
from app.schemas.note import NoteCreate, NoteUpdate, NoteOut, NoteListResponse

# Note: You will eventually need to update note_service to use VbNote instead of sgs_note
from app.services import note_service

router = APIRouter(prefix="/notes", tags=["notes"])

# FIXED: Renamed to avoid import conflicts and updated query logic
def get_scoped_acharya(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
    # FIXED: Made header optional to prevent validation crashes
    x_school_id: Optional[int] = Header(None, description="Legacy multi-tenant school ID")
) -> VbAcharya:
    """
    Helper dependency to verify the user is an active Acharya.
    """
    # FIXED: Replaced current_user.id with user_id and removed the school_id filter
    acharya = db.query(VbAcharya).filter(
        VbAcharya.user_id == current_user.user_id
    ).first()
    
    if not acharya:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized as an Acharya."
        )
    return acharya


@router.get("", response_model=NoteListResponse)
def list_notes(
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    """Fetch all notes for the authenticated Acharya."""
    # FIXED: Mapped to teacher_id instead of id
    notes = note_service.get_notes(db, acharya.teacher_id)
    return NoteListResponse(notes=notes, total=len(notes))


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    """Create a new note (typed / voice / handwritten)."""
    # FIXED: Mapped to teacher_id instead of id
    return note_service.create_note(db, acharya.teacher_id, payload)


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: int,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    # FIXED: Mapped to teacher_id instead of id
    note = note_service.get_note(db, acharya.teacher_id, note_id)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    # FIXED: Mapped to teacher_id instead of id
    note = note_service.update_note(db, acharya.teacher_id, note_id, payload)
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    acharya: VbAcharya = Depends(get_scoped_acharya),
    db: Session = Depends(get_db),
):
    # FIXED: Mapped to teacher_id instead of id
    deleted = note_service.delete_note(db, acharya.teacher_id, note_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")