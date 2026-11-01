const Contact = require('../models/Contact')
const mongoose = require('mongoose')
const { sendContactEmail, sendContactReplyEmail } = require('../config/mailer')

async function getContactMessages(req, res) {
  const messages = await Contact.find().sort({ createdAt: -1 })
  res.json(messages)
}

async function updateContactMessageStatus(req, res) {
  const { id } = req.params
  const { status } = req.body || {}

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid contact message ID.' })
  }
  if (!['Unread', 'Read', 'Replied'].includes(status)) {
    return res.status(400).json({ message: 'Status must be Unread, Read or Replied.' })
  }

  const contact = await Contact.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  )
  if (!contact) return res.status(404).json({ message: 'Contact message not found.' })
  res.json(contact)
}

async function replyToContactMessage(req, res) {
  const { contactId: id, subject, message } = req.body || {}

  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid contact message ID.' })
  }
  if (typeof subject !== 'string' || !subject.trim()) {
    return res.status(400).json({ message: 'A reply subject is required.' })
  }
  if (subject.trim().length > 160) {
    return res.status(400).json({ message: 'Reply subject must be 160 characters or fewer.' })
  }
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'A reply message is required.' })
  }
  if (message.trim().length > 5000) {
    return res.status(400).json({ message: 'Reply message must be 5000 characters or fewer.' })
  }

  const contact = await Contact.findById(id)
  if (!contact) return res.status(404).json({ message: 'Contact message not found.' })

  await sendContactReplyEmail({
    email: contact.email,
    subject: subject.trim().replace(/[\r\n]/g, ' '),
    message: message.trim(),
    customerName: contact.name,
  })

  contact.status = 'Replied'
  contact.replyMessage = message.trim()
  contact.repliedAt = new Date()
  await contact.save()
  res.json(contact)
}

async function submitContactMessage(req, res) {
  const { name, email, phone, subject, message } = req.body || {}
  const values = { name, email, phone, subject, message }

  if (Object.values(values).some((value) => typeof value !== 'string' || !value.trim())) {
    return res.status(400).json({ message: 'Name, email, phone, subject and message are required.' })
  }

  const clean = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    subject: subject.trim(),
    message: message.trim(),
  }

  if (clean.name.length > 100) return res.status(400).json({ message: 'Name must be 100 characters or fewer.' })
  if (clean.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return res.status(400).json({ message: 'Enter a valid email address.' })
  }
  if (clean.phone.length > 40) return res.status(400).json({ message: 'Phone number must be 40 characters or fewer.' })
  if (clean.subject.length > 140) return res.status(400).json({ message: 'Subject must be 140 characters or fewer.' })
  if (clean.message.length > 3000) return res.status(400).json({ message: 'Message must be 3000 characters or fewer.' })

  const contact = await Contact.create(clean)
  let responseMessage = 'Your message has been received. We’ll be in touch soon.'

  try {
    await sendContactEmail(clean)
  } catch (error) {
    console.error('[CONTACT] Message saved, but notification email failed:', error)
    responseMessage = 'Your message was saved, but we could not send an email notification. Our team will review it.'
  }

  res.status(200).json({ message: responseMessage, id: contact.id })
}

module.exports = {
  getContactMessages,
  updateContactMessageStatus,
  replyToContactMessage,
  submitContactMessage,
}
