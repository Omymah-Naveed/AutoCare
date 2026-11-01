const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    category: {
      type: String,
      enum: ['car-care', 'maintenance'],
      required: true,
    },
    image: { type: String, default: '', trim: true },
    duration: { type: String, default: '60 min', trim: true },
    badge: { type: String, default: '', trim: true },
    prices: {
      hatchback: { type: Number, required: true, min: 1 },
      sedan: { type: Number, required: true, min: 1 },
      suv: { type: Number, required: true, min: 1 },
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Service', serviceSchema)
