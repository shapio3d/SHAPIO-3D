require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')

const path = require('path')
const fs = require('fs')

const app = express()

// Trust the first proxy (Railway/Cloudflare) to get the real user IP for rate limiting
app.set('trust proxy', 1)

const PORT = process.env.PORT || 5000

// ─── Ensure upload directory exists ───
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// ─── CORS Configuration (Must be first to handle preflights and attach headers to all responses) ───
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
].filter(Boolean).map(url => url.replace(/\/+$/, ''))

const isOriginAllowed = (origin) => {
  if (!origin) return true // Allow server-to-server, curl, mobile tools

  const cleanOrigin = origin.replace(/\/+$/, '')

  // Local development
  if (
    cleanOrigin.startsWith('http://localhost') ||
    cleanOrigin.startsWith('http://127.0.0.1') ||
    cleanOrigin.startsWith('http://192.168.') ||
    cleanOrigin.startsWith('http://10.') ||
    cleanOrigin.startsWith('http://172.')
  ) {
    return true
  }

  // Explicit allowed list from env
  if (allowedOrigins.includes(cleanOrigin)) {
    return true
  }

  // Any shapio3d.com domain or subdomain (e.g. shapio3d.com, www.shapio3d.com, admin.shapio3d.com)
  try {
    const url = new URL(cleanOrigin)
    const host = url.hostname.toLowerCase()
    if (host === 'shapio3d.com' || host.endsWith('.shapio3d.com') || host.endsWith('.vercel.app')) {
      return true
    }
  } catch (e) {
    // Ignore invalid URL parse
  }

  return false
}

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      callback(null, true)
    } else {
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}

app.use(cors(corsOptions))

// ─── Security & Rate Limiting ───
// Strict CSP
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"], // for Turnstile
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", "https://*"],
      frameSrc: ["'self'", "https://challenges.cloudflare.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// Global Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
})
app.use(globalLimiter)

// Strict Rate Limiter for sensitive routes (Auth/Contact)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again after 15 minutes.' }
})

// ─── Middleware ───
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static files
app.use('/uploads', express.static(uploadDir))

// ─── Routes ───
// Use strict limiter on sensitive endpoints
app.use('/api/auth', strictLimiter)
// contact route limiter moved to route level to protect admin endpoints


// Safely load routes if they exist
const routes = ['auth', 'customers', 'invoices', 'quotations', 'products', 'contact', 'dashboard', 'settings']
routes.forEach(route => {
  const routePath = path.join(__dirname, 'routes', `${route}.js`)
  if (fs.existsSync(routePath)) {
    app.use(`/api/${route}`, require(`./routes/${route}`))
  } else {
    // Stub for missing routes during MVP development
    app.use(`/api/${route}`, (req, res) => res.status(501).json({ error: 'Route not implemented yet' }))
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Global error handler ───
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum allowed size is 10MB.' })
    }
    return res.status(400).json({ error: err.message })
  }

  if (err.statusCode === 400 || err.status === 400 || err.message?.includes('File type') || err.message?.includes('not allowed')) {
    return res.status(400).json({ error: err.message })
  }

  const status = err.statusCode || err.status || 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' && status === 500 ? 'Internal server error' : err.message,
  })
})

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n  ⚡ SHAPIO 3D API running on http://localhost:${PORT}`)
  console.log(`  📦 Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

module.exports = app
