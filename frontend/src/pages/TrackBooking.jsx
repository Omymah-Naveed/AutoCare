import { useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Car,
  CircleX,
  ClipboardList,
  Clock,
  Info,
  MapPin,
  Phone,
  Search,
  User,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { formatDate, formatPrice } from '../lib/data'
import { getApiError, trackBookings } from '../lib/api'

const TIMELINE = ['Pending', 'Confirmed', 'Completed']

function StatusTimeline({ booking }) {
  if (booking.status === 'Cancelled') {
    return (
      <div className="cancelled-banner">
        <CircleX size={18} />
        <div>
          <strong>This booking was cancelled</strong>
          <span>Call the studio to reschedule your appointment.</span>
        </div>
      </div>
    )
  }

  const currentIndex = TIMELINE.indexOf(booking.status)

  return (
    <div
      className="status-timeline"
      aria-label={`Booking status: ${booking.status}`}
    >
      {TIMELINE.map((status, index) => {
        const state =
          index < currentIndex
            ? 'is-done'
            : index === currentIndex
              ? 'is-current'
              : ''
        return (
          <div className={`timeline-step ${state}`} key={status}>
            <span className="timeline-dot" aria-hidden="true" />
            <span className="timeline-label">{status}</span>
          </div>
        )
      })}
    </div>
  )
}

function TrackBooking({ initialQuery = '', onBrowse }) {
  const [query, setQuery] = useState(initialQuery)
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery))
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(initialQuery))

  const searchBookings = async (value) => {
    if (!value.trim()) {
      setError('Enter your booking ID or phone number to continue.')
      setHasSearched(false)
      setResults([])
      return
    }

    setLoading(true)
    setError('')
    try {
      setResults(await trackBookings(value))
      setHasSearched(true)
    } catch (requestError) {
      setResults([])
      setHasSearched(true)
      setError(getApiError(requestError, 'Unable to search bookings right now.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // The request is intentionally triggered when an ID is supplied by the confirmation screen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initialQuery) searchBookings(initialQuery)
  }, [initialQuery])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await searchBookings(query)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setHasSearched(false)
    setError('')
  }

  return (
    <div className="track-page">
      <section className="page-hero track-hero">
        <div className="container">
          <span className="eyebrow">
            <span className="live-dot" />
            Live service updates
          </span>
          <h1>
            Track your car’s <span className="text-red">care.</span>
          </h1>
          <p>
            Enter your booking reference or the phone number you booked with to
            see exactly where your car stands — from Pending to Completed.
          </p>
        </div>
      </section>

      <section className="track-content">
        <div className="container">
          <form className="track-search-card" onSubmit={handleSubmit}>
            <div className="track-search-copy">
              <h2>Find your booking</h2>
              <p>Works with a booking ID or any phone number on file.</p>
            </div>
            <div className="search-row">
              <div className="search-input-wrap">
                <Search size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                    if (error) setError('')
                  }}
                  placeholder="e.g. #AC-1042 or 0300 1234567"
                  aria-label="Booking ID or phone number"
                  aria-invalid={Boolean(error)}
                />
              </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching…' : 'Track'}
              {!loading ? <ArrowRight size={16} /> : null}
              </button>
            </div>
            {error ? (
              <p className="field-error" role="alert">
                {error}
              </p>
            ) : (
              <p className="track-hint">
                <Info size={13} />
                Your reference is on the confirmation screen and SMS. Try
                #AC-1042 for a demo.
              </p>
            )}
          </form>

          <div className="track-results" aria-live="polite">
            {hasSearched && results.length ? (
              <>
                <p className="results-label">
                  {results.length} booking{results.length > 1 ? 's' : ''} found
                  for “{query.trim()}”
                </p>

                {results.map((booking) => (
                  <article className="track-card" key={booking.id}>
                    <div className="track-card-head">
                      <div className="track-refs">
                        <span className="booking-ref-text">#{booking.id}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <strong className="track-amount">
                        {formatPrice(booking.amount)}
                      </strong>
                    </div>

                    <h3>{booking.serviceTitle}</h3>

                    <div className="track-details">
                      <span className="track-detail">
                        <Car size={16} />
                        <span>
                          <strong>{booking.carTypeLabel}</strong> ·{' '}
                          {booking.model}
                        </span>
                      </span>
                      <span className="track-detail">
                        <CalendarDays size={16} />
                        <span>{formatDate(booking.date)}</span>
                      </span>
                      <span className="track-detail">
                        <Clock size={16} />
                        <span>{booking.time}</span>
                      </span>
                      <span className="track-detail">
                        <User size={16} />
                        <span>
                          <strong>{booking.name}</strong> · {booking.phone}
                        </span>
                      </span>
                    </div>

                    <StatusTimeline booking={booking} />

                    <div className="track-card-foot">
                      <span>
                        <MapPin size={14} />
                        AutoCare Studio · Gulberg III, Lahore
                      </span>
                      <a href="tel:+924211122233">
                        <Phone size={14} />
                        Need help? (042) 111 222 33
                      </a>
                    </div>
                  </article>
                ))}
              </>
            ) : null}

            {hasSearched && !results.length ? (
              <div className="track-empty">
                <span className="empty-icon">
                  <Search size={26} />
                </span>
                <h3>No booking found</h3>
                <p>
                  Double-check the reference number or try the phone number you
                  used at checkout. It may take a moment for new bookings to
                  appear.
                </p>
                <div className="track-empty-actions">
                  <button type="button" className="btn btn-primary" onClick={onBrowse}>
                    Browse services
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={clearSearch}>
                    Clear search
                  </button>
                </div>
              </div>
            ) : null}

            {!hasSearched ? (
              <div className="track-placeholder">
                <span className="track-placeholder-icon">
                  <ClipboardList size={28} />
                </span>
                <h2>Your service, live.</h2>
                <p>
                  Search above to see your appointment details and a live status
                  timeline. No account needed.
                </p>

                <div className="track-how">
                  <div>
                    <span>01</span>
                    <strong>Book a slot</strong>
                    <small>Pick a service and time</small>
                  </div>
                  <div>
                    <span>02</span>
                    <strong>Drop off your car</strong>
                    <small>Our team inspects it</small>
                  </div>
                  <div>
                    <span>03</span>
                    <strong>Track to completion</strong>
                    <small>Live status updates</small>
                  </div>
                </div>

                <div className="status-legend">
                  <span className="legend-label">Statuses</span>
                  <StatusBadge status="Pending" />
                  <StatusBadge status="Confirmed" />
                  <StatusBadge status="Completed" />
                  <StatusBadge status="Cancelled" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TrackBooking
