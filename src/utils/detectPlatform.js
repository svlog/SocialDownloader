export const PLATFORMS = {
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
};

const TIKTOK_PATTERN = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com/i;
const IG_REEL_PATTERN = /instagram\.com\/reel\//i;
const IG_STORY_PATTERN = /instagram\.com\/stories\/[^/?#]+\/\d+/i;
const YOUTUBE_PATTERN = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)/i;

/**
 * Detect which platform a URL belongs to.
 * @param {string} url
 * @returns {'tiktok' | 'instagram' | 'youtube' | null}
 */
export const detectPlatform = (url) => {
  if (!url?.trim()) return null;

  const normalized = url.trim();

  if (TIKTOK_PATTERN.test(normalized)) return PLATFORMS.TIKTOK;
  if (IG_REEL_PATTERN.test(normalized) || IG_STORY_PATTERN.test(normalized)) {
    return PLATFORMS.INSTAGRAM;
  }
  if (YOUTUBE_PATTERN.test(normalized)) return PLATFORMS.YOUTUBE;

  return null;
};

/**
 * Detect Instagram content type from URL.
 * @param {string} url
 * @returns {'reel' | 'story' | null}
 */
export const detectInstagramType = (url) => {
  if (!url?.trim()) return null;
  const normalized = url.trim();

  if (IG_STORY_PATTERN.test(normalized)) return 'story';
  if (IG_REEL_PATTERN.test(normalized)) return 'reel';

  return null;
};

/**
 * @param {string} url
 * @returns {boolean}
 */
export const validateMediaUrl = (url) => detectPlatform(url) !== null;
