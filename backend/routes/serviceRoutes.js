const express = require('express')
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController')
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { imageUpload } = require('../config/cloudinary')

const router = express.Router()
router.get('/', getServices)
router.post('/', protect, adminOnly, imageUpload.single('image'), createService)
router.put('/:id', protect, adminOnly, imageUpload.single('image'), updateService)
router.delete('/:id', protect, adminOnly, deleteService)

module.exports = router
