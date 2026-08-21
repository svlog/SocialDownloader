import { sanitizeFilename } from './sanitize';

/**
 * Initiates a file download.
 * If the URL is an internal API endpoint (same-origin), it triggers a direct browser download.
 * Otherwise, it attempts to fetch as blob, falling back to opening in a new tab.
 * 
 * @param {string} url - The URL of the file to download
 * @param {string} filename - The desired name for the downloaded file
 */
export const downloadFile = async (url, filename = 'download.mp4') => {
  if (!url) return;

  const safeFilename = sanitizeFilename(filename, 'download.mp4');

  // For internal proxy endpoints (e.g. /api/youtube/download, /api/instagram/download),
  // use direct link download to avoid loading large video files entirely into browser RAM.
  if (url.startsWith('/api/')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 200);
    return;
  }

  // For external CDN URLs (e.g. TikTok direct play link)
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = safeFilename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch (err) {
    console.warn('Direct blob download failed, falling back to new window:', err);
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};
