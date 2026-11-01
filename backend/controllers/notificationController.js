const Notification = require('../models/Notification')

function roleForUser(user) {
  return user.role === 'admin' ? 'admin' : 'user'
}

async function getNotifications(req, res) {
  const recipientRole = roleForUser(req.user)
  const notifications = await Notification.find({ userId: req.user._id, recipientRole }).sort({ createdAt: -1 }).limit(40)
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, recipientRole, isRead: false })
  res.json({ notifications, unreadCount })
}

async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id, recipientRole: roleForUser(req.user) },
    { isRead: true },
    { new: true },
  )
  if (!notification) return res.status(404).json({ message: 'Notification not found.' })
  res.json(notification)
}

async function markAllNotificationsRead(req, res) {
  await Notification.updateMany(
    { userId: req.user._id, recipientRole: roleForUser(req.user), isRead: false },
    { isRead: true },
  )
  res.json({ message: 'All notifications marked as read.' })
}

module.exports = { getNotifications, markNotificationRead, markAllNotificationsRead }
