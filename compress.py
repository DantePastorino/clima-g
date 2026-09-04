"""Lightweight compression that preserves visual quality.

Images: keep original format. Re-encode JPEGs at q92 with EXIF/ICC stripped and
PNG with optimize=True. Replace only if the new file is smaller.
Videos: H.264 at CRF 28, max width 1280px (720p), keep audio, faststart.
Replace only if smaller.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

JPEG_QUALITY = 92
VIDEO_CRF = 28
VIDEO_MAX_WIDTH = 1280


def fmt(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:6.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def maybe_replace(path: Path, new_path: Path) -> tuple[bool, int, int]:
    old = path.stat().st_size
    new = new_path.stat().st_size
    if new >= old:
        new_path.unlink(missing_ok=True)
        return False, old, old
    shutil.move(str(new_path), str(path))
    return True, old, new


def compress_image(path: Path) -> None:
    old = path.stat().st_size
    suffix = path.suffix.lower()
    tmp = path.with_suffix(path.suffix + ".tmp")

    try:
        with Image.open(path) as im:
            if suffix in (".jpg", ".jpeg"):
                icc = im.info.get("icc_profile")
                im.save(
                    tmp, "JPEG",
                    quality=JPEG_QUALITY,
                    optimize=True,
                    progressive=True,
                    subsampling="4:2:0",
                    exif=b"",
                    icc_profile=icc,
                )
            elif suffix == ".png":
                im.save(tmp, "PNG", optimize=True)
            else:
                return  # HEIC etc. - leave alone

        replaced, old_sz, new_sz = maybe_replace(path, tmp)
        if replaced:
            pct = (1 - new_sz / old_sz) * 100
            print(f"  {str(path.relative_to(ROOT)):60s} {fmt(old_sz)} -> {fmt(new_sz)}  (-{pct:5.1f}%)")
    except Exception as e:
        tmp.unlink(missing_ok=True)
        print(f"  ! {path.relative_to(ROOT)}: {e}")


def compress_video(path: Path) -> None:
    """Web-optimized re-encode: H.264 CRF 28, capped to VIDEO_MAX_WIDTH,
    copy audio, faststart. Replace only if smaller."""
    old = path.stat().st_size
    tmp = path.with_suffix(".tmp" + path.suffix)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    cmd = [
        ffmpeg, "-y", "-i", str(path),
        "-vf", f"scale='min({VIDEO_MAX_WIDTH},iw)':-2",
        "-c:v", "libx264", "-preset", "slow", "-crf", str(VIDEO_CRF),
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-movflags", "+faststart",
        str(tmp),
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        tmp.unlink(missing_ok=True)
        print(res.stderr[-1500:], file=sys.stderr)
        print(f"  ! {path.relative_to(ROOT)}: ffmpeg failed")
        return

    replaced, old_sz, new_sz = maybe_replace(path, tmp)
    if replaced:
        pct = (1 - new_sz / old_sz) * 100
        print(f"  {str(path.relative_to(ROOT)):60s} {fmt(old_sz)} -> {fmt(new_sz)}  (-{pct:5.1f}%)")


def main() -> None:
    image_exts = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}
    video_exts = {".mp4", ".MP4"}

    total_old = total_new = 0
    print("=== IMAGES (JPEG q92 / PNG optimize) ===")
    for p in sorted(ASSETS.rglob("*")):
        if p.is_file() and p.suffix in image_exts:
            before = p.stat().st_size
            compress_image(p)
            after = p.stat().st_size
            total_old += before
            total_new += after

    print("\n=== VIDEOS (H.264 CRF 28, max 1280px, faststart) ===")
    for p in sorted(ASSETS.rglob("*")):
        if p.is_file() and p.suffix in video_exts:
            before = p.stat().st_size
            compress_video(p)
            after = p.stat().st_size
            total_old += before
            total_new += after

    print("\n=== TOTAL ===")
    print(f"  Antes:  {fmt(total_old)}")
    print(f"  Ahora:  {fmt(total_new)}")
    saved = total_old - total_new
    pct = (saved / total_old * 100) if total_old else 0
    print(f"  Ahorro: {fmt(saved)}  (-{pct:.1f}%)")


if __name__ == "__main__":
    main()
