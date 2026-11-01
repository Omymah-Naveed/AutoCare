const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number from 1 to 5.',
    },
  },
  serviceName: { type: String, trim: true, maxlength: 120, default: '' },
  comment: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Review', reviewSchema)
