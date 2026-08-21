import { apiClient } from './client';
import { createMediaResult } from '../utils/mediaModel';
import { sanitizeFilename } from '../utils/sanitize';

/**
 * Fetch TikTok video metadata and download URL without watermark.
 * @param {string} url
 * @returns {Promise<import('../utils/mediaModel').MediaResult>}
 */
export const fetchTikTokVideo = async (url) => {
  if (!url?.trim()) throw new Error('URL is required');

  const response = await apiClient.get('/api/tikwm', {
    params: { url: url.trim() },
  });

  if (response.data?.code === 0 && response.data.data) {
    const data = response.data.data;
    const author = data.author?.nickname || 'tiktok';
    const safeAuthor = sanitizeFilename(author, 'tiktok');

    return createMediaResult({
      platform: 'tiktok',
      type: 'video',
      title: data.title || 'TikTok Video',
      author,
      cover: data.cover || '',
      items: [{
        url: data.play || data.hdplay,
        type: 'video',
        filename: `${safeAuthor}_tiktok.mp4`,
      }],
    });
  }

  throw new Error(response.data?.msg || 'Could not fetch TikTok video details.');
};
