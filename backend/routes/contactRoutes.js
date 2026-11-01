const express = require('express')
const {
  getContactMessages,
  replyToContactMessage,
  updateContactMessageStatus,
  submitContactMessage,
} = require('../controllers/contactController')
const { contactLimiter } = require('../middleware/rateLimit')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()
router.get('/', protect, adminOnly, getContactMessages)
router.post('/reply', protect, adminOnly, replyToContactMessage)
router.post('/', contactLimiter, submitContactMessage)
router.patch('/:id', protect, adminOnly, updateContactMessageStatus)

module.exports = router
