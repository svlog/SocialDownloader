# 🚀 Production Deployment Guide

This guide provides a comprehensive step-by-step walkthrough for deploying **Social Downloader** onto a Linux production server (Ubuntu / Debian) using **Nginx** and **Systemd**.

---

## 📑 Table of Contents
1. [Server Requirements](#1-server-requirements)
2. [Installing System Packages](#2-installing-system-packages)
3. [Repository Setup & Dependencies](#3-repository-setup--dependencies)
4. [Building the Frontend](#4-building-the-frontend)
5. [Configuring YouTube Backend Service (Systemd)](#5-configuring-youtube-backend-service-systemd)
6. [Configuring Web Server (Nginx + SSL)](#6-configuring-web-server-nginx--ssl)
7. [Verification & Maintenance](#7-verification--maintenance)
8. [Troubleshooting Common Issues](#8-troubleshooting-common-issues)

---

## 1. Server Requirements

- **Operating System**: Ubuntu 22.04 / 24.04 LTS or Debian 12
- **Access**: User with `sudo` privileges
- **Domain**: A registered domain name pointing to your server's IP address (e.g. `tik.devcode.ovh`)

---

## 2. Installing System Packages

Update repository package lists and install **Node.js**, **Nginx**, **Python 3**, **FFmpeg**, and **Certbot**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx, Python3, pip, FFmpeg, and Certbot
sudo apt install -y nginx python3 python3-pip python3-venv ffmpeg certbot python3-certbot-nginx

# Install Node.js LTS (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 3. Repository Setup & Dependencies

Place the project in your desired web directory (e.g. `/var/www/tiktokweb`):

```bash
# Create directory and set permissions
sudo mkdir -p /var/www/tiktokweb
sudo chown -R $USER:$USER /var/www/tiktokweb
cd /var/www/tiktokweb

# Install Node.js dependencies
npm install

# Install Python backend dependencies (yt-dlp)
sudo python3 -m pip install -r requirements.txt --break-system-packages
```

---

## 4. Building the Frontend

Generate the optimized production static bundle:

```bash
cd /var/www/tiktokweb
npm run build
```

This will produce the minified HTML, CSS, and JavaScript assets inside the `dist/` directory.

---

## 5. Configuring Unified Backend Service (Systemd)

The backend handler (`server/media-handler.py`) must run continuously in the background on port `9123` to process YouTube and Instagram downloads natively.

1. Copy the systemd service template into `/etc/systemd/system/`:

```bash
sudo cp deploy/youtube-downloader.service.example /etc/systemd/system/media-downloader.service
```

2. Edit the service file if paths or users need adjustment:
```bash
sudo nano /etc/systemd/system/media-downloader.service
```

*Example Unit configuration:*
```ini
[Unit]
Description=Social Downloader - Unified Media Backend Service (yt-dlp)
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/tiktokweb
ExecStart=/usr/bin/python3 /var/www/tiktokweb/server/media-handler.py
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1
Environment=MEDIA_HANDLER_PORT=9123

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

3. Ensure permissions are set for the `www-data` user:
```bash
sudo chown -R www-data:www-data /var/www/tiktokweb
```

4. Reload systemd daemon, enable, and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now media-downloader.service
```

5. Verify service status:
```bash
sudo systemctl status media-downloader.service
```

---

## 6. Configuring Web Server (Nginx + SSL)

1. Create or copy the Nginx configuration:

```bash
sudo cp deploy/tik.conf.example /etc/nginx/sites-available/tiktokweb.conf
sudo nano /etc/nginx/sites-available/tiktokweb.conf
```

2. Replace the domain (`tik.devcode.ovh`) and set `root` to your `dist/` directory.

*Nginx Server Block Configuration:*
```nginx
server {
    listen 80;
    server_name tik.devcode.ovh;

    root /var/www/tiktokweb/dist;
    index index.html;

    # 1. Reverse Proxy for TikTok (TikWM)
    location /api/tikwm {
        proxy_pass https://www.tikwm.com/api/;
        proxy_set_header Host www.tikwm.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_ssl_server_name on;
    }

    # 2. Proxy for Instagram (Native Python backend service on port 9123)
    location /api/instagram {
        proxy_pass http://127.0.0.1:9123/info;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }

    location /api/instagram/download {
        proxy_pass http://127.0.0.1:9123/download;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 600s;
        proxy_buffering off;
    }

    # 3. Reverse Proxy for YouTube (Python backend service on port 9123)
    location /api/youtube/ {
        proxy_pass http://127.0.0.1:9123/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_buffering off;
    }

    # 4. SPA Frontend Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Enable the site configuration and test Nginx syntax:
```bash
sudo ln -sf /etc/nginx/sites-available/tiktokweb.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. Obtain a free SSL certificate with Let's Encrypt Certbot:
```bash
sudo certbot --nginx -d tik.devcode.ovh
```

---

## 7. Verification & Maintenance

- **Inspect YouTube backend service logs in real time**:
  ```bash
  sudo journalctl -u youtube-downloader.service -f
  ```

- **Restart the backend service following code updates**:
  ```bash
  sudo systemctl restart youtube-downloader.service
  ```

- **Keep `yt-dlp` updated** (highly recommended on a regular basis, as YouTube updates video extractors frequently):
  ```bash
  sudo python3 -m pip install --upgrade yt-dlp --break-system-packages
  sudo systemctl restart youtube-downloader.service
  ```

- **Rebuild the frontend following UI changes**:
  ```bash
  cd /var/www/tiktokweb
  npm run build
  ```

---

## 8. Troubleshooting Common Issues

### Issue: `Address already in use` (Port 9123 occupied)
If port 9123 is bound by an old or orphaned process:
```bash
sudo fuser -k 9123/tcp
sudo systemctl restart youtube-downloader.service
```

### Issue: `504 Gateway Time-out` on 4K/1080p Video Downloads
Ensure that `proxy_read_timeout 600s;` is set in the Nginx `location /api/youtube/` block, as downloading and merging high-bitrate video and audio streams may take some time depending on video length.

### Issue: MP3 Audio format fails to convert
Verify that `ffmpeg` is properly installed on the host system:
```bash
ffmpeg -version
```
