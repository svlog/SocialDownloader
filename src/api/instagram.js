import { apiClient } from './client';
import { createMediaResult } from '../utils/mediaModel';

/**
 * Fetch Instagram reel or post metadata and download URLs.
 * @param {string} url
 * @returns {Promise<import('../utils/mediaModel').MediaResult>}
 */
export const fetchInstagramMedia = async (url) => {
  if (!url?.trim()) throw new Error('URL is required');

  const response = await apiClient.get('/api/instagram', {
    params: { url: url.trim() },
  });

  return createMediaResult(response.data);
};
