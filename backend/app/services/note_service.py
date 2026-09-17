import json
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.note import VbNote
from app.models.acharya import VbAcharya
from app.schemas.note import NoteCreate, NoteUpdate, NoteOut


def _to_out(note: VbNote) -> NoteOut:
    try:
        data = json.loads(note.notes or "{}")
        if not isinstance(data, dict):
            data = {"content": str(note.notes)}
    except (json.JSONDecodeError, TypeError):
        data = {"content": note.notes or "", "title": "Note"}

    # FIXED: Updated from created_at to created_datetime
    ts = note.created_datetime or datetime.now(timezone.utc)
    return NoteOut(
        id=f"N{note.notes_id}",
        title=data.get("title", ""),
        content=data.get("content"),
        chapter=data.get("chapter", ""),
        contentType=data.get("content_type", "typed"),
        canvasImageUrl=data.get("canvas_image_url"),
        tags=data.get("tags", []),
        createdAt=ts,
        updatedAt=ts,
    )


def get_notes(db: Session, acharya: VbAcharya) -> List[NoteOut]:
    notes = (
        db.query(VbNote)
        # FIXED: Mapped securely to acharya.teacher_id instead of acharya.id
        .filter(VbNote.teacher_id == acharya.teacher_id) 
        # FIXED: Updated to created_datetime
        .order_by(VbNote.created_datetime.desc())
        .all()
    )
    return [_to_out(n) for n in notes]


def get_note(db: Session, acharya: VbAcharya, note_id: int) -> Optional[NoteOut]:
    note = db.query(VbNote).filter(
        VbNote.notes_id == note_id,
        VbNote.teacher_id == acharya.teacher_id, # FIXED: Mapped to teacher_id
    ).first()
    return _to_out(note) if note else None


def create_note(db: Session, acharya: VbAcharya, payload: NoteCreate) -> NoteOut:
    note = VbNote(
        teacher_id=acharya.teacher_id, # FIXED: Mapped to teacher_id
        notes=json.dumps({
            "title": payload.title,
            "content": payload.content,
            "chapter": payload.chapter,
            "content_type": payload.content_type.value if payload.content_type else "typed",
            "canvas_image_url": payload.canvas_image_url,
            "tags": payload.tags or [],
        }),
        # FIXED: Ensure created_datetime is initialized on creation
        created_datetime=datetime.now(timezone.utc),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return _to_out(note)


def update_note(db: Session, acharya: VbAcharya, note_id: int, payload: NoteUpdate) -> Optional[NoteOut]:
    note = db.query(VbNote).filter(
        VbNote.notes_id == note_id,
        VbNote.teacher_id == acharya.teacher_id, # FIXED: Mapped to teacher_id
    ).first()

    if not note:
        return None

    try:
        existing = json.loads(note.notes or "{}")
        if not isinstance(existing, dict):
            existing = {}
    except (json.JSONDecodeError, TypeError):
        existing = {}

    update_data = payload.model_dump(exclude_unset=True)
    if "content_type" in update_data and update_data["content_type"] is not None:
        ct = update_data["content_type"]
        update_data["content_type"] = ct.value if hasattr(ct, "value") else ct
    existing.update(update_data)
    note.notes = json.dumps(existing)

    db.commit()
    db.refresh(note)
    return _to_out(note)


def delete_note(db: Session, acharya: VbAcharya, note_id: int) -> bool:
    # FIXED: Replaced undefined TeacherNote model with VbNote
    note = db.query(VbNote).filter(
        VbNote.notes_id == note_id,
        VbNote.teacher_id == acharya.teacher_id, # FIXED: Mapped to teacher_id
    ).first()

    if not note:
        return False

    db.delete(note)
    db.commit()
    return True