/**
 * @typedef {'tiktok' | 'instagram' | 'youtube'} Platform
 * @typedef {'video' | 'photo' | 'story' | 'reel' | 'audio'} MediaType
 * @typedef {{ url: string, type: 'video' | 'photo' | 'audio', quality?: number, filename: string }} MediaItem
 * @typedef {{
 *   platform: Platform,
 *   type: MediaType,
 *   title: string,
 *   author: string,
 *   cover: string,
 *   duration?: number,
 *   items: MediaItem[],
 * }} MediaResult
 */

/**
 * @param {Partial<MediaResult>} data
 * @returns {MediaResult}
 */
export const createMediaResult = (data) => ({
  platform: data.platform,
  type: data.type,
  title: data.title || 'Media',
  author: data.author || 'Unknown',
  cover: data.cover || '',
  duration: data.duration || 0,
  items: data.items || [],
});
