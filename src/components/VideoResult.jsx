import { useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { MediaPreview } from './MediaPreview';
import { YouTubeOptions } from './YouTubeOptions';
import { StandardDownloadList } from './StandardDownloadList';

const PLATFORM_CONFIG = {
  tiktok: { label: 'TikTok', color: 'primary' },
  instagram: { label: 'Instagram', color: 'secondary' },
  youtube: { label: 'YouTube', color: 'error' },
};

export const VideoResult = ({ mediaData, onNativeDownload, downloading }) => {
  if (!mediaData) return null;

  const platform = mediaData.platform || 'tiktok';
  const config = PLATFORM_CONFIG[platform] || { label: platform, color: 'primary' };
  const isYouTube = platform === 'youtube';

  const { videoItems, audioItems } = useMemo(() => {
    const items = mediaData.items || [];
    return {
      videoItems: items.filter((item) => item.type === 'video'),
      audioItems: items.filter((item) => item.type === 'audio'),
    };
  }, [mediaData.items]);

  return (
    <>
      <MediaPreview cover={mediaData.cover} duration={mediaData.duration} />

      <Box flex={1} display="flex" flexDirection="column" gap={2} alignItems="flex-start" width="100%">
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Chip label={config.label} size="small" color={config.color} variant="outlined" />
          <Chip label={mediaData.type || 'video'} size="small" />
        </Box>

        <Typography variant="h5" fontWeight="600">
          {mediaData.title}
        </Typography>

        <Typography variant="body1" color="secondary.main">
          {mediaData.author}
        </Typography>

        {isYouTube ? (
          <YouTubeOptions
            videoItems={videoItems}
            audioItems={audioItems}
            onDownload={onNativeDownload}
            downloading={downloading}
          />
        ) : (
          <StandardDownloadList
            items={mediaData.items || []}
            onDownload={onNativeDownload}
            downloading={downloading}
          />
        )}
      </Box>
    </>
  );
};
