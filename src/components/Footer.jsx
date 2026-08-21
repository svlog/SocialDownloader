import { Box, Typography, Container, Divider, Stack } from '@mui/material';
import { Bolt as BoltIcon, Favorite as HeartIcon } from '@mui/icons-material';

export const Footer = () => (
  <Box
    component="footer"
    sx={{
      mt: 'auto',
      pt: 8,
      pb: 5,
      position: 'relative',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      background: 'linear-gradient(180deg, transparent 0%, rgba(7, 7, 9, 0.8) 100%)',
    }}
  >
    <Container maxWidth="lg">
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        gap={3}
        mb={4}
      >
        {/* Logo & Tagline */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff0050 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BoltIcon sx={{ color: '#ffffff', fontSize: 18 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
            Social<Box component="span" sx={{ color: '#ff0050' }}>Downloader</Box>
          </Typography>
        </Box>

        {/* Platform support tags */}
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            TikTok Video HD
          </Typography>
          <Typography variant="body2" color="text.secondary">·</Typography>
          <Typography variant="body2" color="text.secondary">
            Instagram Reels & Fotos
          </Typography>
          <Typography variant="body2" color="text.secondary">·</Typography>
          <Typography variant="body2" color="text.secondary">
            YouTube 4K & MP3
          </Typography>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 3 }} />

      <Box
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        gap={1.5}
        textAlign={{ xs: 'center', sm: 'left' }}
      >
        <Typography variant="caption" color="text.secondary">
          Social Downloader © {new Date().getFullYear()} · Todos los derechos reservados.
        </Typography>

        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
          Hecho con <HeartIcon sx={{ fontSize: 13, color: '#ff0050' }} /> para la comunidad.
        </Typography>
      </Box>
    </Container>
  </Box>
);
