import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, MessageSquareQuote, Send, Star, UserRound } from 'lucide-react'
import { createReview, fetchReviews, getApiError } from '../lib/api'
import { DEFAULT_SERVICES } from '../lib/data'

function ReviewStars({ rating, label }) {
  return (
    <span className="review-stars" aria-label={label || `${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          fill={star <= rating ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

function isValidReview(review) {
  return review
    && typeof review.name === 'string'
    && typeof review.comment === 'string'
    && Number.isInteger(Number(review.rating))
    && Number(review.rating) >= 1
    && Number(review.rating) <= 5
}

function Reviews({ services = [] }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    rating: 5,
    serviceName: '',
    comment: '',
  })

  const serviceOptions = services.length ? services : DEFAULT_SERVICES
  const averageRating = useMemo(() => {
    if (!reviews.length) return null
    return reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
  }, [reviews])

  useEffect(() => {
    let active = true

    fetchReviews()
      .then((result) => {
        const validResult = Array.isArray(result) && result.every(isValidReview)
        if (!validResult) throw new Error('Review data returned by the server is invalid.')
        if (active) {
          setReviews((current) => {
            const fetchedIds = new Set(result.map((review) => review._id).filter(Boolean))
            const pendingReviews = current.filter((review) => review._id && !fetchedIds.has(review._id))
            return [...pendingReviews, ...result]
          })
        }
      })
      .catch((error) => {
        if (active) setLoadError(getApiError(error, 'Unable to load reviews right now.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [retryCount])

  const retryLoadingReviews = () => {
    setLoadError('')
    setLoading(true)
    setRetryCount((count) => count + 1)
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setSubmitError('')
    setSubmitted(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      name: form.name.trim(),
      rating: Number(form.rating),
      serviceName: form.serviceName,
      comment: form.comment.trim(),
    }

    if (!payload.name || !payload.comment || payload.rating < 1 || payload.rating > 5) {
      setSubmitError('Add your name, select a star rating, and write a comment to continue.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    setSubmitted(false)
    try {
      const created = await createReview(payload)
      if (!isValidReview(created) || !created._id) {
        throw new Error('The review was submitted, but its saved details could not be loaded.')
      }
      setReviews((current) => [
        created,
        ...current.filter((review) => review._id !== created._id),
      ])
      setLoadError('')
      setForm({ name: '', rating: 5, serviceName: '', comment: '' })
      setSubmitted(true)
    } catch (error) {
      setSubmitError(getApiError(error, 'Unable to submit your review. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="reviews-page">
      <div className="container">
        <header className="reviews-header">
          <span className="eyebrow">
            <MessageSquareQuote size={14} />
            The AutoCare community
          </span>
          <h1>Feedback <span>&amp; Reviews</span></h1>
          <p>
            Real experiences from drivers who trust us with their cars. Your
            feedback helps us make every visit even better.
          </p>

          <section className="reviews-summary" aria-label="Overall customer rating">
            <div className="reviews-summary-score">
              <strong>{averageRating === null ? '—' : averageRating.toFixed(1)}</strong>
              <span>out of 5.0</span>
            </div>
            <div className="reviews-summary-detail">
              <ReviewStars rating={averageRating || 0} label="Average customer rating" />
              <span>
                {reviews.length
                  ? `Based on ${reviews.length} customer ${reviews.length === 1 ? 'review' : 'reviews'}`
                  : 'Be the first to share your experience'}
              </span>
              <div
                className="reviews-rating-track"
                role="img"
                aria-label={averageRating === null ? 'No ratings yet' : `${averageRating.toFixed(1)} out of 5`}
              >
                <span style={{ width: `${averageRating === null ? 0 : (averageRating / 5) * 100}%` }} />
              </div>
            </div>
          </section>
        </header>

        <div className="reviews-content">
          <section className="review-form-card">
            <div className="review-card-heading">
              <span className="review-heading-icon"><MessageSquareQuote size={19} /></span>
              <div>
                <span className="eyebrow">Your experience matters</span>
                <h2>Leave a review</h2>
                <p>Tell us how we did. It only takes a moment.</p>
              </div>
            </div>

            <form className="review-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="review-name">Your name</label>
                <div className="input-with-icon">
                  <UserRound size={16} aria-hidden="true" />
                  <input
                    id="review-name"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="e.g. Ahmed Khan"
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    required
                  />
                </div>
              </div>

              <fieldset className="review-rating-field">
                <legend>Your rating</legend>
                <div className="review-rating-picker" role="group" aria-label="Select a rating">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={rating <= form.rating ? 'is-selected' : ''}
                      aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`}
                      aria-pressed={form.rating === rating}
                      onClick={() => updateForm('rating', rating)}
                    >
                      <Star size={26} fill={rating <= form.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                  <span>{form.rating} / 5</span>
                </div>
              </fieldset>

              <div className="field">
                <label htmlFor="review-service">Service <span>(optional)</span></label>
                <select
                  id="review-service"
                  name="serviceName"
                  value={form.serviceName}
                  onChange={(event) => updateForm('serviceName', event.target.value)}
                >
                  <option value="">Choose a service</option>
                  {serviceOptions.map((service) => (
                    <option key={service.id || service._id || service.title} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="review-comment">Your review</label>
                <textarea
                  id="review-comment"
                  name="comment"
                  rows={5}
                  maxLength={2000}
                  placeholder="What stood out about your AutoCare experience?"
                  value={form.comment}
                  onChange={(event) => updateForm('comment', event.target.value)}
                  required
                />
              </div>

              {submitError ? <p className="review-form-message is-error" role="alert">{submitError}</p> : null}
              {submitted ? <p className="review-form-message is-success" role="status">Thanks for sharing your feedback!</p> : null}
              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? 'Submitting review…' : 'Submit review'}
                {!submitting ? <Send size={15} /> : null}
              </button>
            </form>
          </section>

          <section className="reviews-list-section" aria-labelledby="reviews-list-title">
            <div className="reviews-list-heading">
              <div>
                <span className="eyebrow">From our customers</span>
                <h2 id="reviews-list-title">Community reviews</h2>
              </div>
              <span className="reviews-count">{reviews.length}</span>
            </div>

            {loading ? (
              <div className="reviews-state" role="status">
                <span className="detail-spinner" aria-hidden="true" />
                <p>Loading customer reviews…</p>
              </div>
            ) : null}

            {!loading && loadError ? (
              <div className="reviews-state reviews-state-error" role="alert">
                <AlertCircle size={23} />
                <h3>Reviews are temporarily unavailable</h3>
                <p>{loadError}</p>
                <button type="button" className="btn btn-ghost" onClick={retryLoadingReviews}>
                  Try again
                </button>
              </div>
            ) : null}

            {!loading && !loadError && reviews.length === 0 ? (
              <div className="reviews-state">
                <MessageSquareQuote size={25} />
                <h3>No reviews yet</h3>
                <p>Your feedback can be the first story in our community.</p>
              </div>
            ) : null}

            {!loading && reviews.length > 0 ? (
              <div className="reviews-grid">
                {reviews.map((review) => {
                  const date = new Date(review.createdAt)
                  const dateLabel = Number.isNaN(date.getTime())
                    ? 'Recently'
                    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

                  return (
                    <article className="review-card" key={review._id || `${review.name}-${review.createdAt}`}>
                      <div className="review-card-top">
                        <span className="review-avatar" aria-hidden="true">
                          {review.name?.trim()?.charAt(0)?.toUpperCase() || <UserRound size={17} />}
                        </span>
                        <div className="review-author">
                          <strong>{review.name || 'AutoCare customer'}</strong>
                          <time dateTime={review.createdAt || undefined}>{dateLabel}</time>
                        </div>
                        <ReviewStars rating={Number(review.rating) || 0} />
                      </div>
                      {review.serviceName ? <span className="review-service-tag">{review.serviceName}</span> : null}
                      <p className="review-comment">{review.comment}</p>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}

export default Reviews
