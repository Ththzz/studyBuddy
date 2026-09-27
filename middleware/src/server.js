import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import { evaluateStudyAnswer, generateStudyContent } from './study-ai.js'
import { HttpError } from './errors.js'

const app = express()
const port = Math.max(1, Number(process.env.PORT || process.env.STUDY_API_PORT) || 3001)
const host = process.env.STUDY_API_HOST?.trim() || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1')
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024,
    files: 1,
    fields: 6,
    fieldSize: 2048,
  },
})

const requestWindows = new Map()
const WINDOW_MS = Math.max(60_000, Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000)
const MAX_REQUESTS_PER_WINDOW = Math.max(1, Number(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 40)

app.disable('x-powered-by')
app.use((req, res, next) => {
  res.setHeader('X-Study-Buddy-Origin', 'middleware')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Cache-Control', 'no-store')
  next()
})
app.use(express.json({ limit: '32kb' }))

function getBearerToken(request) {
  const authorization = request.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || null
}

async function requireAuthenticatedUser(req, res, next) {
  const accessToken = getBearerToken(req)
  const supabaseUrl = process.env.SUPABASE_URL?.trim()?.replace(/\/+$/, '')
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!accessToken) return res.status(401).json({ error: 'Sign in is required to use Study Buddy AI.' })
  if (!supabaseUrl || !publishableKey) {
    console.error('Study middleware authentication is not configured.')
    return res.status(503).json({ error: 'Study Buddy AI authentication is not configured.' })
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const user = response.ok ? await response.json() : null
    if (!user?.id || typeof user.id !== 'string') {
      return res.status(401).json({ error: 'Your sign-in session is invalid or expired. Please sign in again.' })
    }
    req.studyBuddyUser = { id: user.id }
    return next()
  } catch (error) {
    console.error('Study middleware could not verify the user session:', error?.message || 'Unknown error')
    return res.status(503).json({ error: 'Study Buddy AI authentication is temporarily unavailable.' })
  }
}

function limitUserRequests(req, res, next) {
  const now = Date.now()
  const userId = req.studyBuddyUser?.id
  if (!userId) return res.status(401).json({ error: 'Sign in is required to use Study Buddy AI.' })
  let window = requestWindows.get(userId)

  if (!window || now - window.startedAt >= WINDOW_MS) {
    window = { startedAt: now, count: 0 }
    requestWindows.set(userId, window)
  }

  for (const [key, value] of requestWindows) {
    if (now - value.startedAt >= WINDOW_MS) requestWindows.delete(key)
  }

  window.count += 1
  if (window.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ error: 'Too many AI requests. Please wait a few minutes and try again.' })
  }

  return next()
}

function resetRequestWindows() {
  requestWindows.clear()
}

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.post('/api/study/generate', requireAuthenticatedUser, limitUserRequests, upload.single('file'), async (req, res, next) => {
  try {
    const data = await generateStudyContent({
      file: req.file,
      questionCount: req.body.questionCount,
      difficulty: req.body.difficulty,
      outputLanguage: req.body.outputLanguage,
      questionType: req.body.questionType,
    })
    return res.json({ data })
  } catch (error) {
    return next(error)
  }
})

app.post('/api/study/evaluate', requireAuthenticatedUser, limitUserRequests, async (req, res, next) => {
  try {
    const data = await evaluateStudyAnswer(req.body || {})
    return res.json({ data })
  } catch (error) {
    return next(error)
  }
})

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)

  if (error?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Files must be 12 MB or smaller.' })
  }
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  console.error('Study middleware request failed:', error?.message || 'Unknown error')
  return res.status(500).json({ error: 'Something went wrong while processing this request.' })
})

function startServer() {
  return app.listen(port, host, () => {
    console.log(`Study Buddy middleware listening on http://${host}:${port}`)
    if (host !== '127.0.0.1' && host !== 'localhost') {
      console.warn('This server is reachable from other devices on the network. Keep it private until it is deployed behind HTTPS.')
    }
    if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL || !process.env.AI_MODEL) {
      console.warn('AI provider is not configured. Copy middleware/.env.example to middleware/.env and set the provider key.')
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
      console.warn('Supabase authentication is not configured. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to middleware/.env.')
    }
  })
}

if (process.env.NODE_ENV !== 'test') startServer()

export { getBearerToken, limitUserRequests, requireAuthenticatedUser, resetRequestWindows, startServer }
