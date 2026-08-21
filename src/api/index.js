import { detectPlatform, PLATFORMS, validateMediaUrl } from '../utils/detectPlatform';
import { fetchTikTokVideo } from './tiktok';
import { fetchInstagramMedia } from './instagram';
import { fetchYouTubeVideo } from './youtube';

export { validateMediaUrl, detectPlatform, PLATFORMS };

/**
 * Fetch media from TikTok, Instagram, or YouTube based on URL.
 * @param {string} url
 * @returns {Promise<import('../utils/mediaModel').MediaResult>}
 */
export const fetchMedia = async (url) => {
  const platform = detectPlatform(url);

  if (!platform) {
    throw new Error('Unsupported URL. Paste a TikTok, Instagram, or YouTube link.');
  }

  if (platform === PLATFORMS.TIKTOK) {
    return fetchTikTokVideo(url);
  }

  if (platform === PLATFORMS.YOUTUBE) {
    return fetchYouTubeVideo(url);
  }

  return fetchInstagramMedia(url);
};
