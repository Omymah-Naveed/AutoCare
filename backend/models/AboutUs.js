const mongoose = require('mongoose')

const aboutUsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'main' },
  companyName: { type: String, required: true, trim: true, maxlength: 100, default: 'AutoCare' },
  tagline: { type: String, required: true, trim: true, maxlength: 180, default: 'Smart Service, Smoother Drives.' },
  story: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4000,
    default: 'We are a car-only care studio built around transparent advice, skilled hands, and service that respects your time.',
  },
  mission: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
    default: 'Make dependable car care straightforward, transparent, and convenient for every driver.',
  },
  vision: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
    default: 'Set a higher standard for the way drivers experience vehicle care.',
  },
  stats: {
    yearsExperience: { type: Number, min: 0, max: 100, default: 0 },
    carsServiced: { type: Number, min: 0, max: 10000000, default: 0 },
    expertTechnicians: { type: Number, min: 0, max: 1000, default: 0 },
    customerRating: { type: Number, min: 0, max: 5, default: 0 },
  },
  teamMembers: [{
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    bio: { type: String, trim: true, maxlength: 1000, default: '' },
    photoUrl: { type: String, trim: true, maxlength: 2000, default: '' },
  }],
  updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('AboutUs', aboutUsSchema)
