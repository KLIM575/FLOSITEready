import io
import os
import uuid
from typing import Iterable

from fastapi import HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif", "svg", "ico"}
OPTIMIZABLE_RASTER_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

# Форматы, которые конвертируются в WebP для уменьшения размера
WEBP_CONVERTIBLE_EXTENSIONS = {"jpg", "jpeg", "png"}

# Веб: не отдаём гигантские оригиналы; лимиты по сценарию уменьшают вес и улучшают LCP.
MAX_EDGE_DEFAULT = 1280
MAX_EDGE_PRODUCT = 960
MAX_EDGE_LOGO = 280
MAX_EDGE_BANNER = 1280
MAX_EDGE_FAVICON = 96


def _sanitize_extension(filename: str | None, default_ext: str = "jpg") -> str:
    if not filename or "." not in filename:
        return default_ext
    ext = filename.rsplit(".", 1)[-1].lower()
    return ext or default_ext


def _validate_is_image(content_type: str | None, ext: str) -> None:
    ct = (content_type or "").lower()
    if ct.startswith("image/"):
        return
    if ext == "ico" and ct in (
        "application/octet-stream",
        "image/x-icon",
        "image/vnd.microsoft.icon",
    ):
        return
    raise HTTPException(status_code=400, detail="File must be an image")


def _build_filename(prefix: str | None, ext: str) -> str:
    stem = f"{prefix}-" if prefix else ""
    return f"{stem}{uuid.uuid4()}.{ext}"


def _fit_image(image: Image.Image, max_edge: int) -> Image.Image:
    if image.width <= max_edge and image.height <= max_edge:
        return image
    resized = image.copy()
    resized.thumbnail((max_edge, max_edge), Image.Resampling.LANCZOS)
    return resized


def _has_alpha(image: Image.Image) -> bool:
    """Проверяет наличие значимого альфа-канала."""
    if image.mode in ("RGBA", "LA", "PA"):
        return True
    if image.mode == "P" and "transparency" in image.info:
        return True
    return False


def _save_optimized_image(
    image: Image.Image,
    destination: str,
    ext: str,
    *,
    jpeg_quality: int = 80,
    webp_quality: int = 85,
) -> None:
    if ext in {"jpg", "jpeg"}:
        image = image.convert("RGB")
        image.save(
            destination,
            format="JPEG",
            quality=jpeg_quality,
            optimize=True,
            progressive=True,
        )
        return

    if ext == "webp":
        if _has_alpha(image):
            # PNG с прозрачностью → WebP Lossless: нет потери качества, меньше PNG
            source = image.convert("RGBA")
            source.save(destination, format="WEBP", lossless=True, method=6)
        else:
            source = image.convert("RGB")
            source.save(destination, format="WEBP", quality=webp_quality, method=6)
        return

    if image.mode == "P":
        source = image
    elif image.mode in ("RGBA", "LA"):
        source = image.convert("RGBA")
    else:
        source = image.convert("RGB")
    source.save(destination, format="PNG", optimize=True, compress_level=9)


async def save_uploaded_image(
    *,
    file: UploadFile,
    output_dir: str,
    filename_prefix: str | None = None,
    allowed_extensions: Iterable[str] | None = None,
    default_extension: str = "jpg",
    max_edge: int | None = None,
    jpeg_quality: int = 80,
    webp_quality: int = 85,
    convert_to_webp: bool = True,
) -> str:
    """Сохраняет загруженное изображение с оптимизацией.

    При convert_to_webp=True (по умолчанию) JPEG и PNG автоматически
    конвертируются в WebP — на 25-35% меньше при сопоставимом качестве.
    PNG с прозрачностью сохраняется в WebP Lossless (без потери пикселей).
    """
    ext = _sanitize_extension(file.filename, default_ext=default_extension)
    allowed = set(allowed_extensions or ALLOWED_IMAGE_EXTENSIONS)
    if ext not in allowed:
        ext = default_extension

    _validate_is_image(file.content_type, ext)
    os.makedirs(output_dir, exist_ok=True)

    body = await file.read()
    if not body:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if ext not in OPTIMIZABLE_RASTER_EXTENSIONS:
        filename = _build_filename(filename_prefix, ext)
        file_path = os.path.join(output_dir, filename)
        with open(file_path, "wb") as buffer:
            buffer.write(body)
        await file.close()
        return filename

    # JPEG и PNG → WebP при включённой конвертации
    output_ext = "webp" if convert_to_webp and ext in WEBP_CONVERTIBLE_EXTENSIONS else ext

    filename = _build_filename(filename_prefix, output_ext)
    file_path = os.path.join(output_dir, filename)

    cap = max_edge if max_edge is not None else MAX_EDGE_DEFAULT

    try:
        image = Image.open(io.BytesIO(body))
        normalized = ImageOps.exif_transpose(image)
        fitted = _fit_image(normalized, cap)
        _save_optimized_image(
            fitted,
            file_path,
            output_ext,
            jpeg_quality=jpeg_quality,
            webp_quality=webp_quality,
        )
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Failed to process image")
    finally:
        await file.close()

    return filename
