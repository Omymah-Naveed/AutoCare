const bcrypt = require('bcryptjs')
const User = require('../models/User')

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return

  const existing = await User.findOne({ email })
  if (existing) return

  const passwordHash = await bcrypt.hash(password, 12)
  await User.create({ name: process.env.ADMIN_NAME || 'AutoCare Admin', email, password: passwordHash, role: 'admin' })
  console.log(`Admin account created for ${email}`)
}

module.exports = seedAdmin
