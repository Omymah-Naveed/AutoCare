const express = require('express')
const { getAdminReport } = require('../controllers/reportController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()
router.get('/admin/summary', protect, adminOnly, getAdminReport)

module.exports = router
