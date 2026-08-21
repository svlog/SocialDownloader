import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff0050',
      light: '#ff4076',
      dark: '#d60043',
    },
    secondary: {
      main: '#00f2fe',
      light: '#4facfe',
      dark: '#00b4cc',
    },
    background: {
      default: '#070709',
      paper: 'rgba(18, 18, 26, 0.72)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#9e9ea7',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Outfit", "Plus Jakarta Sans", sans-serif',
      fontWeight: 700,
    },
    h6: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '12px 28px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #ff0050 0%, #ff3377 50%, #ff0077 100%)',
          boxShadow: '0 8px 24px -4px rgba(255, 0, 80, 0.45)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 14px 28px -4px rgba(255, 0, 80, 0.65)',
            background: 'linear-gradient(135deg, #ff1a66 0%, #ff4d88 100%)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
          color: '#070709',
          boxShadow: '0 8px 24px -4px rgba(0, 242, 254, 0.35)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 14px 28px -4px rgba(0, 242, 254, 0.55)',
            background: 'linear-gradient(135deg, #33f5fe 0%, #66b5fe 100%)',
          },
        },
        outlinedPrimary: {
          borderColor: 'rgba(255, 0, 80, 0.4)',
          backgroundColor: 'rgba(255, 0, 80, 0.05)',
          '&:hover': {
            borderColor: '#ff0050',
            backgroundColor: 'rgba(255, 0, 80, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
              transition: 'all 0.3s ease',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f2fe',
              borderWidth: '2px',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.25)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(18, 18, 26, 0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '8px',
        },
      },
    },
  },
});

export default theme;
