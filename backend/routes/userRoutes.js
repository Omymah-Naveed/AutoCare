const express = require('express')
const { getProfile, updateProfile, getAdminCustomers } = require('../controllers/userController')
const { imageUpload } = require('../config/cloudinary')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/profile', protect, getProfile)
router.put('/profile', protect, imageUpload.single('profilePicture'), updateProfile)
router.get('/admin/customers', protect, adminOnly, getAdminCustomers)

module.exports = router
