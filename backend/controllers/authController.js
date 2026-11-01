const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/User')
const { sendPasswordResetEmail } = require('../config/mailer')
const { isStrongPassword, PASSWORD_POLICY_MESSAGE } = require('../utils/passwordPolicy')

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture || '',
  }
}

async function signup(req, res) {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' })
  }
  if (!isStrongPassword(password)) return res.status(400).json({ message: PASSWORD_POLICY_MESSAGE })

  const normalizedEmail = email.trim().toLowerCase()
  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) return res.status(409).json({ message: 'An account already exists with this email.' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email: normalizedEmail, password: passwordHash })

  res.status(201).json({ token: createToken(user), user: publicUser(user) })
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' })

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password')
  const valid = user && (await bcrypt.compare(password, user.password))
  if (!valid) {
    console.warn(`[AUTH] Failed login attempt for ${email.trim().toLowerCase()} from ${req.ip}`)
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  res.json({ token: createToken(user), user: publicUser(user) })
}

async function forgotPassword(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase()
  const genericMessage = 'If an account exists for this email, a password reset link has been sent.'
  if (!email) return res.status(400).json({ message: 'Email is required.' })

  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires')
  if (!user) return res.json({ message: genericMessage })

  const rawToken = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
  await user.save({ validateBeforeSave: false })

  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`
  try {
    await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl })
  } catch (error) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save({ validateBeforeSave: false })
    throw error
  }

  res.json({ message: genericMessage })
}

async function resetPassword(req, res) {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ message: 'Reset token and new password are required.' })
  if (!isStrongPassword(password)) return res.status(400).json({ message: PASSWORD_POLICY_MESSAGE })

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+resetPasswordToken +resetPasswordExpires')

  if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' })

  user.password = await bcrypt.hash(password, 12)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  res.json({ message: 'Password reset successfully. You can now log in.' })
}

module.exports = { signup, login, forgotPassword, resetPassword }
