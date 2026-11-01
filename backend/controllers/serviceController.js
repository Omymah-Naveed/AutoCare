const mongoose = require('mongoose')
const Service = require('../models/Service')

// Services created before the detail-page fields existed do not have
// `features`, `includedChecks` or `warranty`. These defaults keep the public
// detail page complete without forcing a database migration.
const DEFAULT_FEATURES = [
  'Certified AutoCare technician assigned to your vehicle',
  'Genuine, OEM-grade products and consumables',
  'Complimentary 20-point vehicle inspection',
  'Final quality check before handover',
]

const DEFAULT_CHECKS = [
  'Pre-service condition walkaround with photo record',
  'Post-service performance verification',
  'Fluid and tyre pressure top-up where applicable',
  'Digital service report attached to your booking',
]

const DEFAULT_WARRANTY =
  '90-day AutoCare workmanship warranty. If anything is not right after the service, we inspect and re-do it free of charge.'

function parsePrices(value) {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    const error = new Error('Prices must be valid JSON.')
    error.statusCode = 400
    throw error
  }
}

function withDetailDefaults(service) {
  const plain = typeof service.toObject === 'function' ? service.toObject() : service
  return {
    ...plain,
    features: plain.features?.length ? plain.features : DEFAULT_FEATURES,
    includedChecks: plain.includedChecks?.length ? plain.includedChecks : DEFAULT_CHECKS,
    warranty: plain.warranty || DEFAULT_WARRANTY,
  }
}

async function getServices(req, res) {
  const services = await Service.find().sort({ createdAt: -1 })
  res.json(services)
}

async function getServiceById(req, res) {
  let service = null
  if (mongoose.isValidObjectId(req.params.id)) {
    service = await Service.findById(req.params.id)
  } else {
    service = await Service.findOne({ slug: req.params.id })
  }
  if (!service) return res.status(404).json({ message: 'Service not found.' })

  res.json(withDetailDefaults(service))
}

async function createService(req, res) {
  const payload = { ...req.body }
  payload.prices = parsePrices(payload.prices)
  if (req.file?.path) payload.image = req.file.path
  const service = await Service.create(payload)
  res.status(201).json(service)
}

async function updateService(req, res) {
  const updates = { ...req.body }
  updates.prices = parsePrices(updates.prices)
  if (req.file?.path) updates.image = req.file.path

  const service = await Service.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
  if (!service) return res.status(404).json({ message: 'Service not found.' })
  res.json(service)
}

async function deleteService(req, res) {
  const service = await Service.findByIdAndDelete(req.params.id)
  if (!service) return res.status(404).json({ message: 'Service not found.' })
  res.json({ message: 'Service deleted successfully.' })
}

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
}
