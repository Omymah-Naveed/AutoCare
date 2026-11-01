const Booking = require('../models/Booking')
const Service = require('../models/Service')
const { notifyBooking } = require('../services/notificationService')

const MAX_CAPACITY = 3
const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
]

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '')
}

function createBookingId() {
  return `AC-${Math.floor(1000 + Math.random() * 9000)}`
}

async function createUniqueBookingId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const bookingId = createBookingId()
    if (!(await Booking.exists({ bookingId }))) return bookingId
  }
  throw new Error('Unable to generate a booking reference. Please try again.')
}

async function createBooking(req, res) {
  const body = req.body
  const requestedServices = Array.isArray(body.services) ? body.services : []
  const required = ['customerName', 'phone', 'carSubType', 'carModel', 'date', 'timeSlot']
  const missing = required.filter((field) => !String(body[field] || '').trim())
  if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` })

  if (!requestedServices.length) return res.status(400).json({ message: 'Select at least one service.' })

  const uniqueServiceIds = [...new Set(requestedServices.map((id) => String(id)))]
  const selectedServices = await Service.find({ _id: { $in: uniqueServiceIds } })
  if (selectedServices.length !== uniqueServiceIds.length) {
    return res.status(400).json({ message: 'One or more selected services are no longer available.' })
  }

  const priceKey = { Hatchback: 'hatchback', Sedan: 'sedan', SUV: 'suv' }[body.carSubType]
  if (!priceKey) return res.status(400).json({ message: 'Invalid car subtype.' })

  const serviceSnapshots = selectedServices.map((service) => ({
    serviceId: service._id.toString(),
    serviceName: service.title,
    amount: service.prices[priceKey],
  }))
  const totalAmount = serviceSnapshots.reduce((sum, service) => sum + service.amount, 0)

  const activeSlotBookings = await Booking.countDocuments({
    date: body.date,
    timeSlot: body.timeSlot,
    status: { $ne: 'Cancelled' },
  })
  if (activeSlotBookings >= MAX_CAPACITY) {
    return res.status(400).json({ message: 'This time slot is fully booked. Please select a different time slot.' })
  }

  const booking = await Booking.create({
    userId: req.user._id,
    bookingId: await createUniqueBookingId(),
    customerName: body.customerName,
    phone: normalizePhone(body.phone),
    carSubType: body.carSubType,
    carModel: body.carModel,
    serviceName: serviceSnapshots.map((service) => service.serviceName).join(' + '),
    serviceId: serviceSnapshots[0].serviceId,
    services: serviceSnapshots,
    date: body.date,
    timeSlot: body.timeSlot,
    amount: totalAmount,
  })
  await notifyBooking({
    booking,
    userMessage: 'Booking request submitted. Awaiting admin approval.',
    adminMessage: 'New booking request received for review.',
  })
  res.status(201).json(booking)
}

async function getSlotAvailability(req, res) {
  const { date } = req.query
  if (!date) return res.status(400).json({ message: 'A date is required.' })

  const counts = await Booking.aggregate([
    { $match: { date, status: { $ne: 'Cancelled' } } },
    { $group: { _id: '$timeSlot', bookingIds: { $addToSet: '$_id' } } },
    { $project: { _id: 1, count: { $size: '$bookingIds' } } },
  ])
  const countMap = Object.fromEntries(counts.map((item) => [item._id, item.count]))
  const slots = Object.fromEntries(TIME_SLOTS.map((slot) => [slot, countMap[slot] || 0]))

  res.json({ date, capacity: MAX_CAPACITY, slots })
}

async function trackBookings(req, res) {
  const query = String(req.query.query || req.params.query || '').trim()
  if (!query) return res.status(400).json({ message: 'Booking ID or phone number is required.' })

  const phoneQuery = normalizePhone(query)
  const conditions = [{ bookingId: query.replace(/^#/, '').toUpperCase() }]
  if (phoneQuery.length >= 3) conditions.push({ phone: { $regex: phoneQuery } })

  const bookings = await Booking.find({ $or: conditions }).sort({ createdAt: -1 })
  res.json(bookings)
}

async function getAdminBookings(req, res) {
  const filter = req.query.status ? { status: req.query.status } : {}
  const bookings = await Booking.find(filter).populate('userId', 'name email').sort({ createdAt: -1 })
  res.json(bookings)
}

async function getMyBookings(req, res) {
  const bookings = await Booking.find({ userId: req.user._id }).populate('userId', 'name email').sort({ createdAt: -1 })
  res.json(bookings)
}

async function cancelMyBooking(req, res) {
  const bookingId = req.params.bookingId.replace(/^#/, '').toUpperCase()
  const booking = await Booking.findOneAndUpdate(
    { bookingId, userId: req.user._id, status: 'Pending' },
    { status: 'Cancelled', cancellationReason: 'Cancelled by customer.' },
    { new: true, runValidators: true },
  )

  if (!booking) {
    const existingBooking = await Booking.findOne({ bookingId, userId: req.user._id }).select('status')
    if (!existingBooking) return res.status(404).json({ message: 'Booking not found.' })
    return res.status(409).json({ message: `This booking cannot be cancelled because it is already ${existingBooking.status.toLowerCase()}.` })
  }

  await notifyBooking({
    booking,
    userMessage: 'Your booking has been cancelled successfully.',
    adminMessage: 'A customer cancelled a pending booking.',
  })
  res.json(booking)
}

async function updateBookingStatus(req, res) {
  const allowed = ['Pending', 'Confirmed', 'Completed', 'Cancelled']
  const { status } = req.body
  const cancellationReason = String(req.body.cancellationReason || '').trim()
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid booking status.' })
  if (status === 'Cancelled' && cancellationReason.length < 3) {
    return res.status(400).json({ message: 'A cancellation reason is required.' })
  }

  const booking = await Booking.findOneAndUpdate(
    { bookingId: req.params.bookingId.replace(/^#/, '').toUpperCase() },
    status === 'Cancelled'
      ? { status, cancellationReason }
      : { status, $unset: { cancellationReason: 1 } },
    { new: true, runValidators: true },
  )
  if (!booking) return res.status(404).json({ message: 'Booking not found.' })
  if (status === 'Confirmed' || status === 'Cancelled') {
    await notifyBooking({
      booking,
      userMessage: status === 'Confirmed'
        ? 'Your booking has been confirmed!'
        : `Your booking request was cancelled. Reason: ${cancellationReason}`,
    })
  }
  res.json(booking)
}

module.exports = {
  createBooking,
  getSlotAvailability,
  trackBookings,
  getAdminBookings,
  getMyBookings,
  cancelMyBooking,
  updateBookingStatus,
}
