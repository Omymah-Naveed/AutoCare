require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/authRoutes')
const serviceRoutes = require('./routes/serviceRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const userRoutes = require('./routes/userRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const reportRoutes = require('./routes/reportRoutes')
const seedAdmin = require('./utils/seedAdmin')
const seedServices = require('./utils/seedServices')

const app = express()
const port = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AutoCare API' })
})
app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reports', reportRoutes)

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }))

app.use((error, req, res, next) => {
  console.error(error)
  if (error.name === 'MulterError' || error.message === 'Only image files are allowed.') {
    return res.status(400).json({ message: error.message })
  }
  if (error.statusCode) return res.status(error.statusCode).json({ message: error.message })
  if (error.code === 11000) return res.status(409).json({ message: 'A record with this value already exists.' })
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(error.errors).map((item) => item.message).join(', ') })
  }
  res.status(500).json({ message: 'Internal server error.' })
})

async function startServer() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from the environment.')
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing from the environment.')

  await mongoose.connect(process.env.MONGO_URI)
  await seedAdmin()
  await seedServices()
  app.listen(port, () => console.log(`AutoCare API running on port ${port}`))
}

startServer().catch((error) => {
  console.error('Server startup failed:', error.message)
  process.exit(1)
})

module.exports = app
