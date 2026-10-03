"""S3 storage — SWAIS VidhyaBharathi.

Books (cover + PDF), chapter PDFs, and worksheets live in a PRIVATE S3 bucket.
Files are never public; they're served via short-lived presigned URLs.

Keys are namespaced by branch + school so nothing leaks across tenants:
    <branch>/<school_id>/granthalaya/<book_id>/<filename>
"""
import boto3
from botocore.config import Config

from app.core.config import (
    AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN,
)

_PRESIGN_EXPIRY = 900  # 15 minutes


def _client():
    # Regional endpoint matters for opt-in regions (e.g. ap-south-2); without it
    # presigned URLs point at the global host and S3 rejects them.
    #
    # When explicit credentials are not configured, boto3 uses its default credential
    # provider chain (env vars → ~/.aws → EC2 IAM instance role). This lets the same
    # code work locally (explicit .env creds) and on EC2 (IAM role, auto-refreshed).
    kwargs = dict(
        region_name=AWS_REGION,
        endpoint_url=f"https://s3.{AWS_REGION}.amazonaws.com" if AWS_REGION else None,
        config=Config(signature_version="s3v4", s3={"addressing_style": "virtual"}),
    )
    if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
        # Temporary STS keys (ASIA…) must include the session token; without it
        # the signed request is rejected by S3 with 403.
        kwargs.update(
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            aws_session_token=AWS_SESSION_TOKEN or None,
        )
    return boto3.client("s3", **kwargs)


def s3_configured() -> bool:
    """True when S3 can be used.

    Bucket and region are always required. For explicit credentials:
    - both key + secret must be present
    - temporary STS keys (ASIA…) also require a session token
    When no explicit credentials are set, the EC2 IAM instance role is assumed.
    """
    if not (AWS_S3_BUCKET and AWS_REGION):
        return False
    if AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY:
        if not (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY):
            return False
        if AWS_ACCESS_KEY_ID.startswith("ASIA") and not AWS_SESSION_TOKEN:
            return False
    # No explicit credentials — boto3 will use the EC2 IAM instance role.
    return True


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
