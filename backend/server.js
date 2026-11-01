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

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json({ limit: '1mb' }))

let databaseConnection = null

function assertEnvironment() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from the environment.')
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing from the environment.')
}

async function connectDatabase() {
  assertEnvironment()
  if (mongoose.connection.readyState === 1) return mongoose.connection

  // Reset the cached promise when the connection has dropped or is closing.
  if (mongoose.connection.readyState !== 2) databaseConnection = null

  if (!databaseConnection) {
    databaseConnection = mongoose
      .connect(process.env.MONGO_URI)
      .then(async () => {
        await seedAdmin()
        await seedServices()
        return mongoose.connection
      })
      .catch((error) => {
        databaseConnection = null
        throw error
      })
  }

  return databaseConnection
}

// Serverless functions are reused between requests, so connect lazily and reuse
// the same connection instead of calling app.listen() on Vercel.
app.use(async (req, res, next) => {
  try {
    await connectDatabase()
    next()
  } catch (error) {
    next(error)
  }
})

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
  await connectDatabase()
  app.listen(port, () => console.log(`AutoCare API running on port ${port}`))
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  })
}

module.exports = app
