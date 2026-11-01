const Notification = require('../models/Notification')
const User = require('../models/User')
const { sendBookingNotificationEmail } = require('../config/mailer')

async function notifyBooking({ booking, userMessage, adminMessage }) {
  const user = await User.findById(booking.userId).select('name email')
  const admin = await User.findOne({ role: 'admin' }).select('name email')
  const notifications = []

  if (user && userMessage) {
    notifications.push({
      userId: user._id,
      recipientRole: 'user',
      message: userMessage,
      bookingId: booking.bookingId,
    })
  }
  if (admin && adminMessage) {
    notifications.push({
      userId: admin._id,
      recipientRole: 'admin',
      message: adminMessage,
      bookingId: booking.bookingId,
    })
  }

  await Notification.insertMany(notifications)

  const emailJobs = []
  const adminNotificationEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (user && userMessage) emailJobs.push(sendBookingNotificationEmail({ email: user.email, name: user.name, bookingId: booking.bookingId, message: userMessage }))
  if (admin && adminMessage && adminNotificationEmail) emailJobs.push(sendBookingNotificationEmail({ email: adminNotificationEmail, name: admin.name, bookingId: booking.bookingId, message: adminMessage }))
  const results = await Promise.allSettled(emailJobs)
  results.filter((result) => result.status === 'rejected').forEach((result) => console.error('Notification email failed:', result.reason?.message || result.reason))
}

module.exports = { notifyBooking }
