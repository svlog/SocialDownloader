import { Box, Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

export const StandardDownloadList = ({ items, onDownload, downloading }) => {
  const getItemLabel = (item, index, total) => {
    if (item.type === 'photo') {
      return total > 1 ? `Descargar foto ${index + 1}` : 'Descargar JPG';
    }
    return total > 1 ? `Descargar vídeo ${index + 1}` : 'Descargar MP4';
  };

  return (
    <Box display="flex" flexDirection="column" gap={1.5} width="100%">
      {items.map((item, index) => (
        <Button
          key={item.url || index}
          variant="contained"
          color="primary"
          startIcon={downloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          fullWidth
          onClick={() => onDownload(item.url, item.filename)}
          disabled={downloading}
        >
          {downloading ? 'Descargando...' : getItemLabel(item, index, items.length)}
        </Button>
      ))}
    </Box>
  );
};
