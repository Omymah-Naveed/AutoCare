const express = require('express')
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController')
const { loginLimiter } = require('../middleware/rateLimit')

const router = express.Router()
router.post('/signup', signup)
router.post('/login', loginLimiter, login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router
