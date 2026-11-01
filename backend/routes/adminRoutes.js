const express = require('express')
const { updateAboutContent } = require('../controllers/aboutController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()
router.put('/about', protect, adminOnly, updateAboutContent)

module.exports = router
