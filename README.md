# Social Downloader (TikTok, Instagram & YouTube)

A modern, high-performance web application to download media content (videos, photos, stories, and audio) from **TikTok**, **Instagram**, and **YouTube** in high definition with no watermarks.

---

## 🚀 Supported Platforms & Features

| Platform | Supported Content Types | Download Formats |
| :--- | :--- | :--- |
| **TikTok** | Standard videos and Shorts | MP4 (No watermark / HD) |
| **Instagram** | Reels and active public Stories | MP4 (video) and JPG (photos) |
| **YouTube** | Standard videos, Shorts, and YouTube Music | MP4 Video (360p, 480p, 720p, 1080p, 1440p, 2160p) & MP3 Audio |

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **React 19** with functional components and custom hooks.
- **Vite 7** as the blazing-fast bundler and development server.
- **Material UI (MUI v7)** with a customized dark mode theme and modern visual styling.
- **Framer Motion** for smooth, fluid UI micro-animations and transitions.
- **Axios** for querying internal API endpoints.

### Backend & Proxies
- **Vite Dev Proxies**:
  - `/api/tikwm`: Reverse proxy pointing directly to the public TikWM API.
  - `/api/instagram`: Native proxy routed to our Python backend service.
  - `/api/youtube`: Native proxy routed to our Python backend service.
- **Unified Media Handler (`yt-dlp` + `ffmpeg`)**:
  - Multithreaded Python HTTP server (`server/media-handler.py`) running on port `9123`.
  - 100% native extraction for YouTube (video + MP3) and Instagram (Reels, Posts, Carousel) without third-party web scrapers.
  - Merges high-resolution video and audio streams seamlessly via `ffmpeg` or extracts high-bitrate MP3 audio.

---

## 📂 Project Structure

```text
TikTokWeb/
├── deploy/
│   ├── tik.conf.example                  # Production Nginx reverse proxy configuration example
│   └── youtube-downloader.service.example# Production systemd service unit template
├── public/                               # Static assets
├── server/
│   ├── media-dev-proxy.mjs               # Vite plugin managing the native Python media backend
│   ├── media-handler.py                  # Unified Python HTTP handler using yt-dlp & ffmpeg
│   └── youtube-handler.py                # Backward compatibility runner
├── src/
│   ├── api/
│   │   ├── index.js                      # Central media API dispatcher
│   │   ├── instagram.js                  # Instagram API client
│   │   ├── tiktok.js                     # TikTok API client
│   │   └── youtube.js                    # YouTube API client
│   ├── components/
│   │   ├── DownloadForm.jsx              # URL input form with clipboard paste button
│   │   ├── Footer.jsx                    # Footer component
│   │   ├── Header.jsx                    # Header with animated title
│   │   └── VideoResult.jsx               # Media preview card with quality & MP3 selectors
│   ├── hooks/
│   │   └── useMediaDownloader.js         # Custom hook for download state & async operations
│   ├── utils/
│   │   ├── detectPlatform.js             # Platform regex detection & URL validator
│   │   ├── download.js                   # Client-side native file download helper
│   │   └── mediaModel.js                 # Unified media result schema
│   ├── App.jsx                           # Main application component
│   ├── main.jsx                          # React application entry point
│   ├── theme.js                          # Material UI custom dark theme
│   └── index.css                         # Global base styles
├── requirements.txt                      # Python backend dependencies
├── package.json                          # Node.js dependencies & scripts
├── vite.config.js                        # Vite configuration & dev middleware plugins
├── DEPLOY.md                             # Production deployment step-by-step guide
└── README.md                             # Project overview & documentation
```

---

## 📋 Prerequisites

1. **Node.js** (v18.0.0 or higher) and **npm**.
2. **Python 3** (v3.9 or higher).
3. **FFmpeg** installed on the system (required for merging YouTube video/audio streams and generating MP3s):
   ```bash
   # On Debian / Ubuntu:
   sudo apt install ffmpeg

   # On Arch Linux:
   sudo pacman -S ffmpeg
   ```
4. **Python Dependencies**:
   ```bash
   python3 -m pip install -r requirements.txt
   ```

---

## ⚡ Installation & Local Development

1. **Clone repository and install Node dependencies**:
   ```bash
   git clone <REPO_URL>
   cd TikTokWeb
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   *Vite will start the web application on `http://localhost:5173` and automatically spawn the YouTube Python backend (`server/youtube-handler.py`) on `http://127.0.0.1:9123`.*

3. **Kill/free any lingering background processes** (if ports get occupied):
   ```bash
   npm run kill
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🔌 Internal API Endpoint Specification

### 1. TikTok (`/api/tikwm`)
- **Method**: `GET`
- **Query Params**: `?url=<TIKTOK_URL>`
- **Response**: TikWM JSON structure containing direct `play` / `hdplay` download URLs.

### 2. Instagram (`/api/instagram`)
- **Method**: `GET`
- **Query Params**: `?url=<INSTAGRAM_REEL_OR_STORY_URL>`
- **Response**:
  ```json
  {
    "platform": "instagram",
    "type": "reel",
    "title": "Instagram Media",
    "author": "@username",
    "cover": "https://...",
    "items": [
      { "url": "https://...", "type": "video", "filename": "username_reel.mp4" }
    ]
  }
  ```

### 3. YouTube Info (`/api/youtube/info`)
- **Method**: `GET`
- **Query Params**: `?url=<YOUTUBE_URL>`
- **Response**:
  ```json
  {
    "title": "Video Title",
    "author": "Channel Name",
    "thumbnail": "https://i.ytimg.com/...",
    "duration": 213,
    "qualities": [360, 480, 720, 1080, 1440, 2160]
  }
  ```

### 4. YouTube Download (`/api/youtube/download`)
- **Method**: `GET`
- **Query Params**:
  - `url`: YouTube video link.
  - `format`: `video` or `audio`.
  - `quality`: Desired video resolution (e.g. `720`, `1080`, `360`).
- **Response**: Binary file stream with `Content-Disposition: attachment` header.

---

## 🌐 Production Deployment

1. Create a systemd service to keep the Python YouTube backend running continuously in the background (`/etc/systemd/system/youtube-downloader.service`):
   ```ini
   [Unit]
   Description=YouTube Downloader Backend (yt-dlp)
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/var/www/tiktokweb
   ExecStart=/usr/bin/python3 server/youtube-handler.py
   Restart=always
   Environment=YT_HANDLER_PORT=9123

   [Install]
   WantedBy=multi-user.target
   ```
   Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now youtube-downloader.service
   ```

2. Configure **Nginx** using [deploy/tik.conf.example](file:///home/undefined/projects/TikTokWeb/deploy/tik.conf.example) as reference.

> 💡 **For the complete, step-by-step production deployment tutorial, please read [DEPLOY.md](file:///home/undefined/projects/TikTokWeb/DEPLOY.md).**
