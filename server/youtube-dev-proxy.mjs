import { spawn } from 'child_process'
import http from 'http'

let handlerProcess = null
const HANDLER_PORT = 9123

/**
 * Check if the Python handler is already running and reachable on HANDLER_PORT.
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
 * Start the Python YouTube handler as a child process if not already running.
 */
async function ensureHandler() {
  if (handlerProcess) return

  const running = await isHandlerReachable()
  if (running) {
    console.log(`[yt-proxy] YouTube handler already active on port ${HANDLER_PORT}`)
    return
  }

  handlerProcess = spawn('python3', ['server/youtube-handler.py'], {
    env: { ...process.env, YT_HANDLER_PORT: String(HANDLER_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  handlerProcess.stdout.on('data', (d) => process.stdout.write(`[yt-handler] ${d}`))
  handlerProcess.stderr.on('data', (d) => process.stderr.write(`[yt-handler] ${d}`))

  handlerProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`[yt-handler] Process exited with code ${code}`)
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

/**
 * Proxy a request to the Python YouTube handler.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {string} targetPath e.g. '/info?url=...'
 */
function proxyToHandler(req, res, targetPath) {
  return new Promise((resolve, reject) => {
    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: HANDLER_PORT,
        path: targetPath,
        method: 'GET',
        timeout: 600_000, // 10 min for large downloads
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        proxyRes.pipe(res)
        proxyRes.on('end', resolve)
      },
    )

    proxyReq.on('error', (err) => {
      console.error('[yt-proxy] Error proxying:', err.message)
      if (!res.headersSent) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'YouTube handler unavailable. Try again.' }))
      }
      reject(err)
    })

    proxyReq.end()
  })
}

/**
 * Vite plugin that adds YouTube middleware and starts the Python handler.
 */
export function youtubeDevPlugin() {
  return {
    name: 'youtube-dev-proxy',
    configureServer(server) {
      ensureHandler()

      const waitForHandler = () =>
        new Promise((resolve) => setTimeout(resolve, 800))

      // /api/youtube/info?url=...
      server.middlewares.use('/api/youtube/info', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        await waitForHandler()
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

      // /api/youtube/download?url=...&format=video|audio&quality=720
      server.middlewares.use('/api/youtube/download', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        await waitForHandler()
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
