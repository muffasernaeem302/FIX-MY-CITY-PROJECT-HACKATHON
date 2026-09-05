"""Storage service - local file storage for dev."""

import os
import uuid
import aiofiles
from pathlib import Path
from app.config import settings


ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_SIZE = 8 * 1024 * 1024  # 8 MB


class LocalStorage:
    def __init__(self):
        self.base_dir = Path(settings.STORAGE_LOCAL_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.public_base = settings.STORAGE_PUBLIC_BASE

    async def save(self, file_data: bytes, content_type: str, filename: str = "") -> dict:
        if content_type not in ALLOWED_TYPES:
            raise ValueError(f"File type not allowed: {content_type}")
        ext = ALLOWED_TYPES[content_type]
        unique_name = f"{uuid.uuid4().hex}{ext}"
        subdir = unique_name[:2]
        subdir_path = self.base_dir / subdir
        subdir_path.mkdir(parents=True, exist_ok=True)
        file_path = subdir_path / unique_name
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(file_data)
        relative_key = f"{subdir}/{unique_name}"
        url = f"{self.public_base}/{relative_key}"
        return {"url": url, "storage_key": relative_key, "mime_type": content_type, "size_bytes": len(file_data)}


storage = LocalStorage()


async def save_upload(file_data: bytes, content_type: str, filename: str = "") -> dict:
    return await storage.save(file_data, content_type, filename)
