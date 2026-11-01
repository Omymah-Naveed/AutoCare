const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 40 },
  subject: { type: String, required: true, trim: true, maxlength: 140 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['Unread', 'Read', 'Replied'], default: 'Unread' },
  replyMessage: { type: String, trim: true, maxlength: 5000, default: '' },
  repliedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Contact', contactSchema)
