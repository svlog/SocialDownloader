import { apiClient } from './client';
import { createMediaResult } from '../utils/mediaModel';
import { sanitizeFilename } from '../utils/sanitize';

/**
 * Fetch YouTube video metadata and available qualities.
 * @param {string} url
 * @returns {Promise<import('../utils/mediaModel').MediaResult>}
 */
export const fetchYouTubeVideo = async (url) => {
  if (!url?.trim()) throw new Error('URL is required');

  const normalizedUrl = url.trim();
  const response = await apiClient.get('/api/youtube/info', {
    params: { url: normalizedUrl },
  });

  const data = response.data;
  const author = data.author || 'youtube';
  const safeAuthor = sanitizeFilename(author, 'youtube');

  // Build items: one video per available quality + one audio (MP3)
  const items = [];
  const qualities = data.qualities?.length ? data.qualities : [720];

  for (const q of qualities) {
    items.push({
      url: `/api/youtube/download?url=${encodeURIComponent(normalizedUrl)}&format=video&quality=${q}`,
      type: 'video',
      quality: q,
      filename: `${safeAuthor}_youtube_${q}p.mp4`,
    });
  }

  items.push({
    url: `/api/youtube/download?url=${encodeURIComponent(normalizedUrl)}&format=audio`,
    type: 'audio',
    quality: null,
    filename: `${safeAuthor}_youtube.mp3`,
  });

  return createMediaResult({
    platform: 'youtube',
    type: 'video',
    title: data.title || 'YouTube Video',
    author,
    cover: data.thumbnail || '',
    duration: data.duration || 0,
    items,
  });
};
