const { rateLimit, ipKeyGenerator } = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = String(req.body?.email || '').trim().toLowerCase() || 'unknown-account'
    return `${ipKeyGenerator(req.ip)}:${email}`
  },
  handler: (req, res) => {
    res.status(429).json({ message: 'Too many failed login attempts. Please try again after 5 minutes.' })
  },
})

module.exports = { loginLimiter }
