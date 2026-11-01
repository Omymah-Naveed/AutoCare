const User = require('../models/User')
const Booking = require('../models/Booking')

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture || '',
  }
}

async function getProfile(req, res) {
  res.json(publicUser(req.user))
}

async function updateProfile(req, res) {
  const updates = {}
  if (typeof req.body.name === 'string' && req.body.name.trim()) {
    updates.name = req.body.name.trim()
  }
  if (req.file?.path) updates.profilePicture = req.file.path

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  })

  res.json(publicUser(user))
}

async function getAdminCustomers(req, res) {
  const customers = await User.find({ role: 'customer' })
    .select('name email profilePicture createdAt')
    .sort({ createdAt: -1 })
    .lean()
  const customerIds = customers.map((customer) => customer._id)
  const stats = await Booking.aggregate([
    { $match: { userId: { $in: customerIds } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$userId',
        totalBookings: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
        completedRevenue: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, { $ifNull: ['$amount', 0] }, 0] } },
        lastBookingDate: { $first: '$createdAt' },
        phone: { $first: '$phone' },
      },
    },
  ])
  const statsByCustomer = new Map(stats.map((item) => [String(item._id), item]))
  res.json(customers.map((customer) => ({
    id: String(customer._id),
    name: customer.name,
    email: customer.email,
    profilePicture: customer.profilePicture || '',
    registeredAt: customer.createdAt,
    ...(statsByCustomer.get(String(customer._id)) || { totalBookings: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, completedRevenue: 0, lastBookingDate: null, phone: '' }),
  })))
}

module.exports = { getProfile, updateProfile, getAdminCustomers }
