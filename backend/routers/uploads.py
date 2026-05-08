import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import models, auth
from database import get_db, settings

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

ALLOWED_QUOTE_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".webm"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB


def _save_file(upload: UploadFile, directory: str, allowed_ext: set) -> str:
    ext = os.path.splitext(upload.filename)[1].lower()
    if ext not in allowed_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' is not allowed. Allowed: {', '.join(allowed_ext)}",
        )

    content = upload.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File '{upload.filename}' exceeds the 10MB size limit",
        )

    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(directory, unique_name)

    os.makedirs(directory, exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(content)

    # Return web-accessible path
    return f"/uploads/{os.path.relpath(file_path, settings.UPLOADS_DIR).replace(os.sep, '/')}"


@router.post("/quote-files")
def upload_quote_files(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user),
):
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 files allowed per upload")

    directory = os.path.join(settings.UPLOADS_DIR, "quotes")
    saved_paths = []

    for upload in files:
        path = _save_file(upload, directory, ALLOWED_QUOTE_EXTENSIONS)
        saved_paths.append(path)

    return {"files": saved_paths, "count": len(saved_paths)}


@router.post("/portfolio-image")
def upload_portfolio_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    directory = os.path.join(settings.UPLOADS_DIR, "portfolio")
    path = _save_file(file, directory, ALLOWED_IMAGE_EXTENSIONS)
    return {"file": path}


@router.post("/portfolio-video")
def upload_portfolio_video(
    file: UploadFile = File(...),
    _: models.User = Depends(auth.require_admin),
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{ext}' not allowed. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}",
        )
    content = file.file.read()
    if len(content) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Video exceeds the 100MB size limit",
        )
    directory = os.path.join(settings.UPLOADS_DIR, "portfolio")
    os.makedirs(directory, exist_ok=True)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(directory, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)
    path = f"/uploads/{os.path.relpath(file_path, settings.UPLOADS_DIR).replace(os.sep, '/')}"
    return {"file": path}
