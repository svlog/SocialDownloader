import { Box, Typography, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import {
  AutoAwesome as SparklesIcon,
  PlayCircleOutline as VideoIcon,
  MusicNote as MusicIcon,
} from '@mui/icons-material';

const PLATFORMS = [
  { name: 'TikTok', color: '#ff0050', bg: 'rgba(255, 0, 80, 0.12)', border: 'rgba(255, 0, 80, 0.3)' },
  { name: 'Instagram', color: '#e1306c', bg: 'rgba(225, 48, 108, 0.12)', border: 'rgba(225, 48, 108, 0.3)' },
  { name: 'YouTube', color: '#ff0000', bg: 'rgba(255, 0, 0, 0.12)', border: 'rgba(255, 0, 0, 0.3)' },
  { name: 'Audio MP3', color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.12)', border: 'rgba(0, 242, 254, 0.3)' },
];

export const Header = () => {
  return (
    <Box textAlign="center" mb={{ xs: 4, md: 5 }} pt={{ xs: 3, md: 5 }}>
      {/* Top Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 2.2,
            py: 0.75,
            borderRadius: '50px',
            background: 'linear-gradient(90deg, rgba(255, 0, 80, 0.15), rgba(0, 242, 254, 0.15))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            mb: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <SparklesIcon sx={{ color: '#00f2fe', fontSize: 18 }} />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.02em',
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Sin marcas de agua · Calidad HD & 4K · Extractor MP3
          </Typography>
        </Box>
      </motion.div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.4rem', sm: '3.5rem', md: '4.25rem' },
            lineHeight: 1.1,
            mb: 2,
            fontWeight: 900,
          }}
        >
          Descarga Vídeos y Audio{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(135deg, #ff0050 0%, #ff4b82 30%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              filter: 'drop-shadow(0 0 35px rgba(255, 0, 80, 0.35))',
            }}
          >
            al Instante
          </Box>
        </Typography>
      </motion.div>

      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 620,
            mx: 'auto',
            fontWeight: 400,
            fontSize: { xs: '0.95rem', md: '1.15rem' },
            lineHeight: 1.5,
            mb: 3,
          }}
        >
          Guarda tus vídeos favoritos de TikTok, Reels de Instagram y contenido de YouTube en máxima resolución o formato MP3 en segundos.
        </Typography>
      </motion.div>

      {/* Interactive Platform Badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ gap: 1, rowGap: 1 }}
        >
          {PLATFORMS.map((p) => (
            <Chip
              key={p.name}
              icon={p.name === 'Audio MP3' ? <MusicIcon sx={{ fontSize: 16, color: `${p.color} !important` }} /> : <VideoIcon sx={{ fontSize: 16, color: `${p.color} !important` }} />}
              label={p.name}
              size="small"
              sx={{
                backgroundColor: p.bg,
                color: '#ffffff',
                border: `1px solid ${p.border}`,
                fontWeight: 600,
                fontSize: '0.8rem',
                py: 1.75,
                px: 0.5,
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 14px ${p.border}`,
                  backgroundColor: p.bg,
                },
              }}
            />
          ))}
        </Stack>
      </motion.div>
    </Box>
  );
};
