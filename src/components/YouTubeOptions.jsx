import { Box, Typography, Button, CircularProgress } from '@mui/material';
import {
  Download as DownloadIcon,
  MusicNote as MusicIcon,
  HighQuality as HQIcon,
} from '@mui/icons-material';

export const YouTubeOptions = ({ videoItems, audioItems, onDownload, downloading }) => {
  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      {videoItems.length > 0 && (
        <Box>
          <Box display="flex" alignItems="center" gap={0.75} mb={1}>
            <HQIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Vídeo MP4
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {videoItems.map((item) => (
              <Button
                key={item.url}
                variant="outlined"
                color="primary"
                startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                onClick={() => onDownload(item.url, item.filename)}
                disabled={downloading}
                sx={{ minWidth: 105 }}
              >
                {downloading ? '...' : `${item.quality}p`}
              </Button>
            ))}
          </Box>
        </Box>
      )}

      {audioItems.length > 0 && (
        <Box>
          <Box display="flex" alignItems="center" gap={0.75} mb={1}>
            <MusicIcon fontSize="small" color="secondary" />
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Audio MP3
            </Typography>
          </Box>
          {audioItems.map((item) => (
            <Button
              key={item.url}
              variant="contained"
              color="secondary"
              startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <MusicIcon />}
              onClick={() => onDownload(item.url, item.filename)}
              disabled={downloading}
              fullWidth
            >
              {downloading ? 'Descargando...' : 'Descargar MP3'}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
};
