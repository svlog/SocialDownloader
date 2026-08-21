import { Box, TextField, Button, CircularProgress, IconButton, Tooltip, Typography, Alert } from '@mui/material';
import {
  Download as DownloadIcon,
  ContentPaste as PasteIcon,
  Clear as ClearIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

export const DownloadForm = ({ url, onUrlChange, onPaste, onDownload, loading, error }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && url.trim()) {
      onDownload();
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          position: 'relative',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pega aquí el enlace de TikTok, Instagram o YouTube..."
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          slotProps={{
            input: {
              startAdornment: (
                <Box sx={{ color: 'text.secondary', mr: 1, display: 'flex', alignItems: 'center' }}>
                  <LinkIcon fontSize="small" />
                </Box>
              ),
              endAdornment: (
                <Box display="flex" alignItems="center" gap={0.5}>
                  {url && (
                    <Tooltip title="Limpiar">
                      <IconButton
                        size="small"
                        onClick={() => onUrlChange('')}
                        edge="end"
                        disabled={loading}
                        sx={{ color: 'text.secondary', '&:hover': { color: '#ffffff' } }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Pegar del portapapeles">
                    <IconButton
                      onClick={onPaste}
                      edge="end"
                      disabled={loading}
                      sx={{
                        color: 'secondary.main',
                        backgroundColor: 'rgba(0, 242, 254, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(0, 242, 254, 0.2)' },
                      }}
                    >
                      <PasteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              height: { xs: 54, sm: 60 },
              fontSize: { xs: '0.95rem', md: '1.05rem' },
            },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onDownload}
          disabled={loading || !url.trim()}
          startIcon={loading ? <CircularProgress size={22} color="inherit" /> : <DownloadIcon />}
          sx={{
            minWidth: { xs: '100%', sm: 170 },
            height: { xs: 52, sm: 60 },
            fontSize: '1.05rem',
            fontWeight: 800,
            flexShrink: 0,
            borderRadius: '12px',
          }}
        >
          {loading ? 'Obteniendo...' : 'Descargar'}
        </Button>
      </Box>

      {/* Helper text / error banner */}
      {error ? (
        <Alert
          severity="error"
          variant="filled"
          sx={{
            borderRadius: 3,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            backdropFilter: 'blur(10px)',
            py: 0.5,
          }}
        >
          {error}
        </Alert>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            ⚡ Compatible con TikTok (vídeo HD), Instagram Reels / Fotos y YouTube (vídeo 4K o MP3).
          </Typography>
        </Box>
      )}
    </Box>
  );
};
