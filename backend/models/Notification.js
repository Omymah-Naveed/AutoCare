const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipientRole: { type: String, enum: ['user', 'admin'], required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    bookingId: { type: String, required: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Notification', notificationSchema)
