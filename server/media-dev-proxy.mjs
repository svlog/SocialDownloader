import { spawn } from 'child_process'
import http from 'http'

let handlerProcess = null
const HANDLER_PORT = 9123

/**
 * Check if the Python media handler is reachable.
 */
function isHandlerReachable() {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: HANDLER_PORT,
        path: '/info',
        method: 'GET',
        timeout: 1000,
      },
      () => resolve(true),
    )
    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })
    req.end()
  })
}

/**
 * Start the Python Media handler as a child process if not already running.
 */
async function ensureHandler() {
  const alreadyRunning = await isHandlerReachable()
  if (alreadyRunning) {
    return
  }

  if (!handlerProcess) {
    handlerProcess = spawn('python3', ['server/media-handler.py'], {
      env: { ...process.env, MEDIA_HANDLER_PORT: String(HANDLER_PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    handlerProcess.stdout.on('data', (d) => process.stdout.write(`[media-handler] ${d}`))
    handlerProcess.stderr.on('data', (d) => process.stderr.write(`[media-handler] ${d}`))

    handlerProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`[media-handler] Process exited with code ${code}`)
      }
      handlerProcess = null
    })

    const killHandler = () => {
      if (handlerProcess) {
        try {
          handlerProcess.kill('SIGTERM')
        } catch {}
        handlerProcess = null
      }
    }

    process.once('exit', killHandler)
    process.once('SIGINT', () => {
      killHandler()
      process.exit(0)
    })
    process.once('SIGTERM', () => {
      killHandler()
      process.exit(0)
    })
  }

  // Poll for up to 3 seconds until reachable
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 100))
    if (await isHandlerReachable()) {
      return
    }
  }
}

/**
 * Proxy a request to the Python handler.
 */
function proxyToHandler(req, res, targetPath) {
  return new Promise((resolve, reject) => {
    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: HANDLER_PORT,
        path: targetPath,
        method: 'GET',
        timeout: 600_000,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
        proxyRes.on('end', resolve)
      },
    )

    proxyReq.on('error', (err) => {
      console.error('[media-proxy] Error proxying:', err.message)
      if (!res.headersSent) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Backend media handler unavailable. Please try again.' }))
      }
      reject(err)
    })

    proxyReq.end()
  })
}

/**
 * Vite plugin that starts the Python media backend and handles proxying.
 */
export function mediaDevPlugin() {
  return {
    name: 'media-dev-proxy',
    configureServer(server) {
      ensureHandler()

      // Universal /api/instagram route
      server.middlewares.use('/api/instagram', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        await ensureHandler()
        const requestUrl = new URL(req.url, 'http://localhost')
        const mediaUrl = requestUrl.searchParams.get('url')
        const pathname = requestUrl.pathname

        if (!mediaUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'URL is required' }))
          return
        }

        const isDownload = pathname.includes('/download')
        const targetPath = isDownload
          ? `/download?url=${encodeURIComponent(mediaUrl)}`
          : `/info?url=${encodeURIComponent(mediaUrl)}`

        try {
          await proxyToHandler(req, res, targetPath)
        } catch {
          // Error handled in proxyToHandler
        }
      })

      // /api/youtube/info
      server.middlewares.use('/api/youtube/info', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        await ensureHandler()
        const requestUrl = new URL(req.url, 'http://localhost')
        const mediaUrl = requestUrl.searchParams.get('url')

        if (!mediaUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'URL is required' }))
          return
        }

        const targetPath = `/info?url=${encodeURIComponent(mediaUrl)}`
        try {
          await proxyToHandler(req, res, targetPath)
        } catch {
          // Error handled in proxyToHandler
        }
      })

      // /api/youtube/download
      server.middlewares.use('/api/youtube/download', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        await ensureHandler()
        const requestUrl = new URL(req.url, 'http://localhost')
        const mediaUrl = requestUrl.searchParams.get('url')
        const format = requestUrl.searchParams.get('format') || 'video'
        const quality = requestUrl.searchParams.get('quality') || '720'

        if (!mediaUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'URL is required' }))
          return
        }

        const targetPath = `/download?url=${encodeURIComponent(mediaUrl)}&format=${format}&quality=${quality}`
        try {
          await proxyToHandler(req, res, targetPath)
        } catch {
          // Error handled in proxyToHandler
        }
      })

      server.httpServer?.on('close', () => {
        if (handlerProcess) {
          try {
            handlerProcess.kill('SIGTERM')
          } catch {}
          handlerProcess = null
        }
      })
    },
  }
}

export const youtubeDevPlugin = mediaDevPlugin
