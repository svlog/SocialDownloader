import { Box, Typography, Chip, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Bolt as BoltIcon } from '@mui/icons-material';

export const Navbar = () => {
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 16,
        zIndex: 1100,
        px: { xs: 2, md: 4 },
        mb: 2,
      }}
    >
      <Container maxWidth="lg" sx={{ px: '0 !important' }}>
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              px: { xs: 2.5, sm: 3.5 },
              borderRadius: '50px',
              backgroundColor: 'rgba(15, 15, 22, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            }}
          >
            {/* Logo */}
            <Box display="flex" alignItems="center" gap={1.25}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ff0050 0%, #00f2fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 0, 80, 0.35)',
                }}
              >
                <BoltIcon sx={{ color: '#ffffff', fontSize: 20 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(90deg, #ffffff 0%, #e2e8f0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Social<Box component="span" sx={{ color: '#ff0050', WebkitTextFillColor: '#ff0050' }}>Downloader</Box>
              </Typography>
            </Box>

            {/* Status Pill */}
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 10px #10b981',
                      animation: 'pulseDot 2s infinite',
                      '@keyframes pulseDot': {
                        '0%': { transform: 'scale(0.95)', opacity: 0.8 },
                        '50%': { transform: 'scale(1.3)', opacity: 1 },
                        '100%': { transform: 'scale(0.95)', opacity: 0.8 },
                      },
                    }}
                  />
                }
                label="Online · 100% Gratis"
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  pl: 0.5,
                }}
              />
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};
