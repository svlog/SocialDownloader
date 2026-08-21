/**
 * Sanitizes a string to be safely used as part of a filename.
 * @param {string} str
 * @param {string} fallback
 * @returns {string}
 */
export const sanitizeFilename = (str, fallback = 'download') => {
  if (!str) return fallback;
  const sanitized = str.replace(/[^a-zA-Z0-9_-]/g, '').trim();
  return sanitized || fallback;
};
