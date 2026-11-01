const Booking = require('../models/Booking')

function dateMatch(query) {
  const match = {}
  if (query.from || query.to) {
    match.date = {}
    if (query.from) match.date.$gte = String(query.from)
    if (query.to) match.date.$lte = String(query.to)
  }
  if (query.status && ['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(query.status)) match.status = query.status
  return match
}

async function getAdminReport(req, res) {
  const match = dateMatch(req.query)
  const [overview, statusBreakdown, dailyBookings, serviceBreakdown, bookings] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      { $group: { _id: null, totalBookings: { $sum: 1 }, completedRevenue: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, { $ifNull: ['$amount', 0] }, 0] } }, estimatedValue: { $sum: { $ifNull: ['$amount', 0] } } } },
    ]),
    Booking.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.aggregate([{ $match: match }, { $group: { _id: '$date', count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, { $ifNull: ['$amount', 0] }, 0] } } } }, { $sort: { _id: 1 } }]),
    Booking.aggregate([{ $match: match }, { $unwind: { path: '$services', preserveNullAndEmptyArrays: true } }, { $group: { _id: { $ifNull: ['$services.serviceName', '$serviceName'] }, bookings: { $sum: 1 }, value: { $sum: { $ifNull: ['$services.amount', '$amount'] } } } }, { $sort: { bookings: -1 } }]),
    Booking.find(match).populate('userId', 'name email').sort({ createdAt: -1 }).lean(),
  ])
  const totals = overview[0] || { totalBookings: 0, completedRevenue: 0, estimatedValue: 0 }
  const statuses = Object.fromEntries(['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => [status, statusBreakdown.find((item) => item._id === status)?.count || 0]))
  res.json({
    summary: { ...totals, ...statuses },
    statusBreakdown: Object.entries(statuses).map(([status, count]) => ({ status, count })),
    dailyBookings: dailyBookings.map((item) => ({ date: item._id, count: item.count, revenue: item.revenue })),
    serviceBreakdown: serviceBreakdown.map((item) => ({ service: item._id || 'Service', bookings: item.bookings, value: item.value })),
    exportData: bookings.map((booking) => ({ bookingId: booking.bookingId, customer: booking.userId?.name || booking.customerName, email: booking.userId?.email || '', phone: booking.phone, service: booking.serviceName, vehicle: `${booking.carSubType} · ${booking.carModel}`, date: booking.date, time: booking.timeSlot, amount: booking.amount || 0, status: booking.status, cancellationReason: booking.cancellationReason || '' })),
  })
}

module.exports = { getAdminReport }
