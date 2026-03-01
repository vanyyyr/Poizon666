"""Image upload endpoint using Supabase Storage."""
from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import urllib.request
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xjfrvfxuzijvuszpwfhd.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
BUCKET_NAME = "order-images"


@router.post("")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to Supabase Storage and return its public URL."""
    if not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="SUPABASE_KEY not configured")

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Read file data
    data = await file.read()
    if len(data) > 5 * 1024 * 1024:  # 5MB max
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Generate unique filename
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    storage_path = f"uploads/{filename}"

    # Upload to Supabase Storage
    try:
        upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{storage_path}"
        req = urllib.request.Request(
            upload_url,
            data=data,
            headers={
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "apikey": SUPABASE_KEY,
                "Content-Type": file.content_type or "image/jpeg",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status not in (200, 201):
                raise HTTPException(status_code=500, detail="Upload failed")

        # Return public URL
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{storage_path}"
        return {"url": public_url, "filename": filename}

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        logger.error(f"Supabase upload error: {e.code} {error_body}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {error_body}")
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
