"""S3 storage — SWAIS VidhyaBharathi.

Books (cover + PDF), chapter PDFs, and worksheets live in a PRIVATE S3 bucket.
Files are never public; they're served via short-lived presigned URLs.

Keys are namespaced by branch + school so nothing leaks across tenants:
    <branch>/<school_id>/granthalaya/<book_id>/<filename>
"""
import boto3
from botocore.config import Config

from app.core.config import (
    AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
)

_PRESIGN_EXPIRY = 900  # 15 minutes


def _client():
    # Regional endpoint matters for opt-in regions (e.g. ap-south-2), or presigned
    # URLs point at the global host and S3 rejects them.
    return boto3.client(
        "s3",
        region_name=AWS_REGION,
        endpoint_url=f"https://s3.{AWS_REGION}.amazonaws.com" if AWS_REGION else None,
        aws_access_key_id=AWS_ACCESS_KEY_ID or None,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY or None,
        config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
    )


def s3_configured() -> bool:
    """True only when all four AWS vars are present. Gate every S3 call on this."""
    return bool(AWS_S3_BUCKET and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and AWS_REGION)


def build_key(branch: str, school_id: str, *parts: str) -> str:
    return "/".join([branch, school_id, *[str(p) for p in parts]])


def upload_fileobj(fileobj, key: str, content_type: str | None = None) -> str:
    extra = {"ContentType": content_type} if content_type else {}
    _client().upload_fileobj(fileobj, AWS_S3_BUCKET, key, ExtraArgs=extra)
    return key


def presign_get(key: str, expiry: int = _PRESIGN_EXPIRY) -> str:
    """Short-lived read URL. Give this to the browser, never the raw object."""
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_S3_BUCKET, "Key": key},
        ExpiresIn=expiry,
    )
