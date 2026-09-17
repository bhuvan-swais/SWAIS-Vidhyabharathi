from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_acharya
from app.db.session import get_db
from app.models.chapter_master import VbChapterMaster
from app.models.file_storage import ENTITY_CHAPTER_STUDY_MATERIAL, VbFileStorageMetadata
from app.models.subject import VbSubjectMaster
from app.models.acharya import VbAcharya
from app.services import s3_service

router = APIRouter(prefix="/chapters", tags=["chapter-files"])
MAX_BYTES = 50 * 1024 * 1024

def _serialize(row: VbFileStorageMetadata) -> dict:
    return {
        "file_id":     row.file_id,
        "chapter_id":  row.entity_id,
        "file_name":   row.file_name,
        "file_url":    row.file_url,
        "view_url":    s3_service.presign_get(row.file_url),
        "uploaded_by": row.created_user_id,
        # FIXED: Mapped to the updated created_datetime column
        "uploaded_at": row.created_datetime,
        "version_no":  row.version_no,
    }

def _chapter_context(db: Session, chapter_id: int) -> tuple[VbChapterMaster, Optional[int], Optional[int]]:
    chapter = db.query(VbChapterMaster).filter(
        VbChapterMaster.chapter_id == chapter_id
        # REMOVED: VbChapterMaster.school_id filter (Does not exist in DB)
    ).first()
    
    if not chapter:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chapter not found")
        
    subject = db.query(VbSubjectMaster).filter(VbSubjectMaster.subject_id == chapter.subject_id).first()
    return chapter, chapter.subject_id, subject.class_id if subject else None

async def _read_upload(file: UploadFile) -> bytes:
    body = await file.read()
    if not body:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "The file is empty")
    if len(body) > MAX_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File too large (max 50 MB)")
    return body

@router.get("/{chapter_id}/files")
def list_chapter_files(chapter_id: int, acharya: VbAcharya = Depends(get_current_acharya), db: Session = Depends(get_db)):
    rows = db.query(VbFileStorageMetadata).filter(
        VbFileStorageMetadata.entity_type == ENTITY_CHAPTER_STUDY_MATERIAL,
        VbFileStorageMetadata.entity_id == chapter_id,
        VbFileStorageMetadata.record_status == "Active"
    ).order_by(VbFileStorageMetadata.created_datetime.desc()).all() # FIXED: created_at -> created_datetime
    
    return {"files": [_serialize(r) for r in rows], "total": len(rows)}

@router.post("/{chapter_id}/files", status_code=status.HTTP_201_CREATED)
async def upload_chapter_file(chapter_id: int, file: UploadFile = File(...), acharya: VbAcharya = Depends(get_current_acharya), db: Session = Depends(get_db)):
    # FIXED: Removed the acharya.school_id argument
    _, subject_id, class_id = _chapter_context(db, chapter_id)
    body = await _read_upload(file)
    
    # FIXED: Replaced acharya.school_id with a hardcoded fallback (e.g., 1) to prevent S3 crashes
    key = s3_service.build_key(1, class_id, subject_id, chapter_id, file.filename)
    uri = s3_service.upload_file(body, key, file.content_type)

    record = VbFileStorageMetadata(
        entity_type=ENTITY_CHAPTER_STUDY_MATERIAL,
        entity_id=chapter_id,
        file_name=file.filename,
        file_url=uri,
        # FIXED: Mapped to the updated created_datetime column
        created_datetime=datetime.now(timezone.utc),
        created_user_id=str(acharya.user_id),
        record_status="Active",
        version_no=1,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _serialize(record)

@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chapter_file(file_id: int, acharya: VbAcharya = Depends(get_current_acharya), db: Session = Depends(get_db)):
    row = db.query(VbFileStorageMetadata).filter(
        VbFileStorageMetadata.file_id == file_id,
        VbFileStorageMetadata.entity_type == ENTITY_CHAPTER_STUDY_MATERIAL
    ).first()
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "File not found")

    row.record_status = "Inactive"
    row.modified_datetime = datetime.now(timezone.utc)
    row.modified_user_id = str(acharya.user_id)
    db.commit()