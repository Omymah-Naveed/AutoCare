const Review = require('../models/Review')

async function getReviews(req, res) {
  const reviews = await Review.find().sort({ createdAt: -1 })
  res.json(reviews)
}

async function createReview(req, res) {
  const payload = req.body || {}
  const review = await Review.create({
    name: payload.name,
    rating: payload.rating,
    serviceName: payload.serviceName || '',
    comment: payload.comment,
  })
  res.status(201).json(review)
}

async function deleteReview(req, res) {
  const review = await Review.findByIdAndDelete(req.params.id)
  if (!review) return res.status(404).json({ message: 'Review not found.' })
  res.json({ message: 'Review deleted successfully.' })
}

module.exports = { getReviews, createReview, deleteReview }
