import { Container, Paper, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import { useMediaDownloader } from './hooks/useMediaDownloader';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { DownloadForm } from './components/DownloadForm';
import { VideoResult } from './components/VideoResult';
import { Footer } from './components/Footer';

function App() {
  const {
    url,
    loading,
    downloading,
    mediaData,
    error,
    handleUrlChange,
    handlePaste,
    handleDownload,
    handleNativeDownload,
  } = useMediaDownloader();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: { xs: 2, md: 4 } }}>
        {/* Hero Section */}
        <Header />

        {/* Search & Download Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 780,
              mx: 'auto',
              p: { xs: 2.5, sm: 3.5, md: 4 },
              borderRadius: 2.5,
              mb: 4,
              boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            <DownloadForm
              url={url}
              onUrlChange={handleUrlChange}
              onPaste={handlePaste}
              onDownload={handleDownload}
              loading={loading}
              error={error}
            />
          </Paper>
        </motion.div>

        {/* Video Result Card */}
        <AnimatePresence>
          {mediaData && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4 }}
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 780,
                  mx: 'auto',
                  p: { xs: 3, sm: 4 },
                  borderRadius: 2.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 3, sm: 4 },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  mb: 4,
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  boxShadow: '0 24px 48px -12px rgba(0, 242, 254, 0.15)',
                }}
              >
                <VideoResult
                  mediaData={mediaData}
                  onNativeDownload={handleNativeDownload}
                  downloading={downloading}
                />
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      <Footer />
    </Box>
  );
}

export default App;
