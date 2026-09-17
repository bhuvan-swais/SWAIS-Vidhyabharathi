import re
import uuid
from datetime import datetime, timezone
from typing import Optional
from urllib.parse import urlparse

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import HTTPException, status

from app.core.config import settings

PREFIX = "study-material"
ASSIGNMENT_PREFIX = "assignments"
PRESIGN_EXPIRY = 3600  # 1 hour


def _client():
    # CRITICAL: aws_session_token must be passed when using STS assumed roles.
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION,
        endpoint_url=f"https://s3.{settings.AWS_REGION}.amazonaws.com",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID or None,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY or None,
        aws_session_token=getattr(settings, "AWS_SESSION_TOKEN", None),
        config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
    )


def _slugify(filename: str) -> str:
    """Keep the extension, make the stem URL-safe."""
    stem, _, ext = filename.rpartition(".")
    stem = stem or filename
    ext = f".{ext}" if ext and stem != filename else ""
    stem = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-")
    return f"{stem}{ext}"


# FIXED: Removed school_id parameter and URL prefix
def build_key(class_id: int, subject_id: int, chapter_id: int, filename: str) -> str:
    """study-material/class-18/subject-26/chapter-38/<ts>-<uuid8>-<slug>.pdf"""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return (
        f"{PREFIX}/class-{class_id}/subject-{subject_id}/chapter-{chapter_id}/"
        f"{ts}-{uuid.uuid4().hex[:8]}-{_slugify(filename)}"
    )


# FIXED: Removed school_id parameter and URL prefix
def build_assignment_key(class_id: int, assignment_id: int, filename: str) -> str:
    """assignments/class-18/assignment-42/<ts>-<uuid8>-<slug>.<ext>"""
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return (
        f"{ASSIGNMENT_PREFIX}/class-{class_id}/assignment-{assignment_id}/"
        f"{ts}-{uuid.uuid4().hex[:8]}-{_slugify(filename)}"
    )


def to_uri(key: str) -> str:
    return f"s3://{settings.AWS_S3_BUCKET_NAME}/{key}"


def parse_uri(file_url: str) -> tuple[str, str]:
    if file_url.startswith("s3://"):
        p = urlparse(file_url)
        return p.netloc, p.path.lstrip("/")
    p = urlparse(file_url)
    if p.netloc.endswith("amazonaws.com"):
        return p.netloc.split(".")[0], p.path.lstrip("/")
    return settings.AWS_S3_BUCKET_NAME, file_url.lstrip("/")


def upload_file(body: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    if not settings.AWS_S3_BUCKET_NAME:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "S3 is not configured")
    try:
        _client().put_object(
            Bucket=settings.AWS_S3_BUCKET_NAME,
            Key=key,
            Body=body,
            ContentType=content_type,
        )
    except ClientError as e:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Upload to S3 failed: {e}")
    return to_uri(key)


def presign_get(file_url: str) -> Optional[str]:
    if not file_url:
        return None
    bucket, key = parse_uri(file_url)
    try:
        return _client().generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=PRESIGN_EXPIRY,
        )
    except ClientError:
        return None


def delete_object(file_url: str) -> bool:
    bucket, key = parse_uri(file_url)
    try:
        _client().delete_object(Bucket=bucket, Key=key)
        return True
    except ClientError:
        return False