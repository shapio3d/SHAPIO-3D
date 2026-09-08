const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')

// ─── JWT Auth (legacy) ───
function authMiddleware(req, res, next) {
  try {
    let token = null
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.adminId = decoded.adminId
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ─── Supabase Auth ───
const supabaseAuthClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const tokenCache = new Map()

async function requireSupabaseAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  const token = authHeader.split(' ')[1]

  if (tokenCache.has(token)) {
    req.user = tokenCache.get(token)
    return next()
  }

  try {
    const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    tokenCache.set(token, user)
    setTimeout(() => tokenCache.delete(token), 60 * 1000) // 1m cache

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

module.exports = authMiddleware
module.exports.requireSupabaseAuth = requireSupabaseAuth
