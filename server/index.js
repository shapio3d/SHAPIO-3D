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
const PORT = process.env.PORT || 5000

// ─── Ensure upload directory exists ───
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

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
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
})
app.use(globalLimiter)

// Strict Rate Limiter for sensitive routes (Auth/Contact)
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again after 15 minutes.' }
})

// ─── Middleware ───
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Strict CORS — specific origins only
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.ADMIN_URL || 'http://localhost:5174',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}))

// Static files
app.use('/uploads', express.static(uploadDir))

// ─── Routes ───
// Use strict limiter on sensitive endpoints
app.use('/api/auth', strictLimiter)
app.use('/api/contact', strictLimiter)

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
  const status = err.statusCode || 500
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// ─── Start ───
app.listen(PORT, () => {
  console.log(`\n  ⚡ SHAPIO 3D API running on http://localhost:${PORT}`)
  console.log(`  📦 Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

module.exports = app
