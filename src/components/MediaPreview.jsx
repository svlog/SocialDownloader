import { Box, Typography, IconButton } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';

/**
 * Format duration in seconds to mm:ss or hh:mm:ss.
 * @param {number} seconds
 * @returns {string | null}
 */
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const MediaPreview = ({ cover, duration }) => {
  const durationLabel = formatDuration(duration);

  return (
    <Box
      sx={{
        width: { xs: '100%', sm: 180 },
        height: 240,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: cover ? `url(${cover})` : 'none',
        backgroundColor: 'grey.900',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton
          aria-label="Preview video"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            '&:hover': { backgroundColor: 'primary.main' },
          }}
        >
          <PlayIcon fontSize="large" sx={{ color: 'white' }} />
        </IconButton>
      </Box>

      {durationLabel && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.75)',
            borderRadius: 1,
            px: 1,
            py: 0.25,
          }}
        >
          <Typography variant="caption" color="white" fontWeight={600}>
            {durationLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
