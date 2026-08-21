import { useState, useCallback } from 'react';
import { fetchMedia, validateMediaUrl } from '../api';
import { downloadFile } from '../utils/download';

export const useMediaDownloader = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mediaData, setMediaData] = useState(null);
  const [error, setError] = useState('');

  const handleUrlChange = useCallback((newUrl) => {
    setUrl(newUrl);
    setError('');
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError('');
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable', err);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError('Please paste a TikTok, Instagram, or YouTube link.');
      return;
    }

    if (!validateMediaUrl(trimmedUrl)) {
      setError('Unsupported URL. Please use a valid TikTok, Instagram, or YouTube link.');
      return;
    }

    setLoading(true);
    setError('');
    setMediaData(null);

    try {
      const data = await fetchMedia(trimmedUrl);
      setMediaData(data);
    } catch (err) {
      setError(err.message || 'Could not fetch media content. Please verify the URL and try again.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  const handleNativeDownload = useCallback(async (mediaUrl, filename) => {
    try {
      setDownloading(true);
      await downloadFile(mediaUrl, filename);
    } finally {
      setDownloading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUrl('');
    setMediaData(null);
    setError('');
    setLoading(false);
  }, []);

  return {
    url,
    loading,
    downloading,
    mediaData,
    error,
    handleUrlChange,
    handlePaste,
    handleDownload,
    handleNativeDownload,
    reset,
  };
};
