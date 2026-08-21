#!/usr/bin/env python3
"""
Unified Media Download Handler using yt-dlp & ffmpeg.
Supports:
  - YouTube (Video in multiple resolutions + MP3 Audio extraction)
  - Instagram (Reels, Videos, Photos, Carousel posts) - 100% Native
  - TikTok (Direct video download without watermarks)

Endpoints:
  GET /info?url=...               → JSON with media metadata & download items
  GET /download?url=...&format=.. → Streams media file with attachment header
"""

import http.server
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.parse

PORT = int(os.environ.get("MEDIA_HANDLER_PORT", os.environ.get("YT_HANDLER_PORT", 9123)))
PYTHON = sys.executable
CHUNK_SIZE = 1024 * 1024  # 1 MB buffer for fast, low-CPU streaming

# URL Regex patterns for whitelist matching
YT_URL_RE = re.compile(
    r"^https?://(?:www\.|m\.|music\.)?(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)", re.I
)
IG_URL_RE = re.compile(
    r"^https?://(?:www\.)?instagram\.com/(?:reel|p|tv|stories)/", re.I
)
TIKTOK_URL_RE = re.compile(
    r"^https?://(?:www\.|vm\.|vt\.)?tiktok\.com/", re.I
)

# Accepted video quality heights for YouTube
QUALITY_MAP = {
    "360":  "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]",
    "480":  "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]",
    "720":  "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]",
    "1080": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]",
}


def sanitize_filename_str(name, fallback="download"):
    """Sanitize filename to prevent header injection or filesystem issues."""
    if not name:
        return fallback
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', str(name)).strip('._')
    return clean or fallback


def detect_platform(url):
    """Detect supported platform from URL, ensuring strict URL protocol matching."""
    if not url or not isinstance(url, str):
        return None
    url_str = url.strip()
    if not re.match(r"^https?://", url_str, re.I):
        return None
    if YT_URL_RE.search(url_str):
        return "youtube"
    if IG_URL_RE.search(url_str):
        return "instagram"
    if TIKTOK_URL_RE.search(url_str):
        return "tiktok"
    return None


COOKIE_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cookies.txt")


def get_media_info(url):
    """Extract media metadata using yt-dlp subprocess safely."""
    platform = detect_platform(url)
    if not platform:
        raise ValueError("Unsupported or invalid URL. Only YouTube, Instagram, and TikTok URLs are accepted.")

    cmd = [
        PYTHON, "-m", "yt_dlp",
        "--dump-json",
        "--no-warnings",
        "--skip-download",
    ]

    # Use cookies if available
    if os.path.exists(COOKIE_FILE) and os.path.getsize(COOKIE_FILE) > 50:
        cmd.extend(["--cookies", COOKIE_FILE])

    cmd.extend(["--", url.strip()])

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

    if result.returncode != 0:
        err = result.stderr.strip()
        if "login" in err.lower() or "authentication" in err.lower() or "story" in err.lower():
            if platform == "instagram":
                raise RuntimeError("Instagram requiere inicio de sesión para ver esta Historia. Los Reels y publicaciones públicas no requieren login.")
            raise RuntimeError("Content is private or requires authentication.")
        raise RuntimeError(err or "Failed to extract media information.")

    stdout = result.stdout.strip()
    if not stdout:
        raise RuntimeError("No media found for the given URL.")

    lines = [l for l in stdout.split("\n") if l.strip()]
    entries = []
    for line in lines:
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue

    if not entries:
        raise RuntimeError("Failed to parse media metadata.")

    if platform == "youtube":
        return format_youtube_info(entries[0])
    elif platform == "instagram":
        return format_instagram_info(entries, url)
    else:
        return format_generic_info(entries[0], url, platform)


def format_youtube_info(info):
    formats = info.get("formats", [])
    seen_heights = set()
    qualities = []
    for f in formats:
        if f.get("vcodec") == "none":
            continue
        h = f.get("height")
        if h and h >= 240 and h not in seen_heights:
            seen_heights.add(h)
            qualities.append(h)

    qualities.sort()
    standard = [q for q in qualities if q in (360, 480, 720, 1080, 1440, 2160)]
    if not standard and qualities:
        standard = qualities

    return {
        "platform": "youtube",
        "type": "video",
        "title": info.get("title", "YouTube Video"),
        "author": info.get("uploader") or info.get("channel") or "Unknown",
        "thumbnail": info.get("thumbnail", ""),
        "duration": info.get("duration", 0),
        "qualities": standard,
    }


def format_instagram_info(entries, original_url):
    first = entries[0]
    author = first.get("uploader") or first.get("channel") or "instagram"
    safe_author = sanitize_filename_str(author, "instagram")
    title = first.get("title") or first.get("description") or "Instagram Media"
    if len(title) > 90:
        title = title[:87] + "..."

    cover = first.get("thumbnail") or ""
    is_reel = "/reel/" in original_url

    items = []
    for idx, entry in enumerate(entries):
        is_video = entry.get("vcodec") != "none" or entry.get("ext") == "mp4" or entry.get("video_ext") == "mp4"
        item_type = "video" if is_video else "photo"
        ext = "mp4" if item_type == "video" else "jpg"
        suffix = f"_{idx + 1}" if len(entries) > 1 else ""
        filename = f"{safe_author}_instagram{suffix}.{ext}"

        download_url = f"/api/instagram/download?url={urllib.parse.quote(original_url)}&index={idx}"
        items.append({
            "url": download_url,
            "type": item_type,
            "filename": filename,
        })

    return {
        "platform": "instagram",
        "type": "reel" if is_reel else ("video" if items and items[0]["type"] == "video" else "photo"),
        "title": title,
        "author": f"@{author}" if not author.startswith("@") else author,
        "cover": cover,
        "duration": first.get("duration", 0),
        "items": items,
    }


def format_generic_info(info, original_url, platform):
    title = info.get("title", "Media")
    author = info.get("uploader") or info.get("channel") or "Unknown"
    cover = info.get("thumbnail", "")
    return {
        "platform": platform,
        "type": "video",
        "title": title,
        "author": author,
        "cover": cover,
        "duration": info.get("duration", 0),
        "items": [{
            "url": f"/api/{platform}/download?url={urllib.parse.quote(original_url)}",
            "type": "video",
            "filename": f"{platform}_download.mp4",
        }],
    }


def download_media(url, fmt, quality, output_path, index=0):
    """Download and process video/audio with yt-dlp safely."""
    platform = detect_platform(url)
    if not platform:
        raise ValueError("Unsupported URL format.")

    if fmt == "audio":
        cmd = [
            PYTHON, "-m", "yt_dlp",
            "--no-warnings",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "-o", output_path,
        ]
    elif platform == "youtube":
        fmt_str = QUALITY_MAP.get(str(quality), QUALITY_MAP["720"])
        cmd = [
            PYTHON, "-m", "yt_dlp",
            "--no-warnings",
            "-f", fmt_str,
            "--merge-output-format", "mp4",
            "-o", output_path,
        ]
    else:
        cmd = [
            PYTHON, "-m", "yt_dlp",
            "--no-warnings",
            "-f", "best",
            "-o", output_path,
        ]

    if os.path.exists(COOKIE_FILE) and os.path.getsize(COOKIE_FILE) > 50:
        cmd.extend(["--cookies", COOKIE_FILE])

    cmd.extend(["--", url.strip()])

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "yt-dlp media download failed")


class MediaHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[{self.client_address[0]}] {fmt % args}", flush=True)

    def _send_json(self, status, data):
        try:
            body = json.dumps(data).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except BrokenPipeError:
            pass

    def _send_error(self, status, message):
        self._send_json(status, {"error": message})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        url = params.get("url", [None])[0]

        if parsed.path in ("/info", "/youtube/info", "/instagram/info"):
            self._handle_info(url)
        elif parsed.path in ("/download", "/youtube/download", "/instagram/download"):
            fmt = params.get("format", ["video"])[0]
            quality = params.get("quality", ["720"])[0]
            index = int(params.get("index", ["0"])[0])
            self._handle_download(url, fmt, quality, index)
        else:
            self._send_error(404, "Endpoint not found")

    def _handle_info(self, url):
        if not url:
            self._send_error(400, "URL is required")
            return

        try:
            self.log_message("Extracting info for: %s", url)
            info = get_media_info(url)
            self.log_message("Info extracted: %s [%s]", info.get("title"), info.get("platform"))
            self._send_json(200, info)
        except ValueError as ve:
            self._send_error(400, str(ve))
        except Exception as e:
            self.log_message("Error extracting info: %s", str(e)[:200])
            self._send_error(502, f"Could not fetch media details: {e}")

    def _handle_download(self, url, fmt, quality, index=0):
        if not url:
            self._send_error(400, "URL is required")
            return

        ext = "mp3" if fmt == "audio" else "mp4"

        with tempfile.TemporaryDirectory() as tmpdir:
            output_template = os.path.join(tmpdir, "output.%(ext)s")
            try:
                self.log_message("Downloading media (fmt=%s, q=%s) for: %s", fmt, quality, url)
                download_media(url, fmt, quality, output_template, index)
                self.log_message("Download complete")
            except ValueError as ve:
                self._send_error(400, str(ve))
                return
            except Exception as e:
                self.log_message("Download error: %s", str(e)[:200])
                self._send_error(502, f"Download failed: {e}")
                return

            files = [os.path.join(tmpdir, f) for f in os.listdir(tmpdir) if os.path.isfile(os.path.join(tmpdir, f))]
            if not files:
                self._send_error(502, "Download completed but output file was not found.")
                return

            actual_file = files[0]
            actual_ext = os.path.splitext(actual_file)[1].lower()

            if actual_ext in (".jpg", ".jpeg"):
                mime = "image/jpeg"
            elif actual_ext == ".png":
                mime = "image/png"
            elif actual_ext == ".mp3":
                mime = "audio/mpeg"
            else:
                mime = "video/mp4"

            file_size = os.path.getsize(actual_file)
            safe_download_name = sanitize_filename_str(f"media_download{actual_ext}", "download.mp4")

            try:
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(file_size))
                self.send_header(
                    "Content-Disposition",
                    f'attachment; filename="{safe_download_name}"',
                )
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                with open(actual_file, "rb") as fh:
                    while chunk := fh.read(CHUNK_SIZE):
                        self.wfile.write(chunk)
            except BrokenPipeError:
                self.log_message("Client disconnected during streaming")


class ThreadedHTTPServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def main():
    server = ThreadedHTTPServer(("127.0.0.1", PORT), MediaHandler)
    print(f"Unified media handler listening on http://127.0.0.1:{PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()


if __name__ == "__main__":
    main()
