const Service = require('../models/Service')

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

async function getServices(req, res) {
  const services = await Service.find().sort({ createdAt: -1 })
  res.json(services)
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

module.exports = { getServices, createService, updateService, deleteService }
