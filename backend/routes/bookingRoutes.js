const express = require('express')
const {
  createBooking,
  getSlotAvailability,
  trackBookings,
  getAdminBookings,
  getMyBookings,
  cancelMyBooking,
  updateBookingStatus,
} = require('../controllers/bookingController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()
router.post('/', protect, createBooking)
router.get('/slot-availability', getSlotAvailability)
router.get('/track', trackBookings)
router.get('/track/:query', trackBookings)
router.get('/my-bookings', protect, getMyBookings)
router.patch('/:bookingId/cancel', protect, cancelMyBooking)
router.get('/admin/all', protect, adminOnly, getAdminBookings)
router.patch('/:bookingId/status', protect, adminOnly, updateBookingStatus)

module.exports = router
