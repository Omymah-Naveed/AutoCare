import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Car,
  CarFront,
  Check,
  Clock,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react'
import { fetchService, getApiError } from '../lib/api'
import {
  CAR_TYPES,
  CATEGORY_LABELS,
  DEFAULT_SERVICES,
  formatPrice,
  getStartingPrice,
} from '../lib/data'

const CAR_ICONS = {
  hatchback: CarFront,
  sedan: Car,
  suv: Truck,
}

const CATEGORY_ICONS = {
  'car-care': Sparkles,
  maintenance: Wrench,
}

const FALLBACK_FEATURES = [
  'Certified AutoCare technician assigned to your vehicle',
  'Genuine, OEM-grade products and consumables',
  'Complimentary 20-point vehicle inspection',
  'Final quality check before handover',
]

const FALLBACK_CHECKS = [
  'Pre-service condition walkaround with photo record',
  'Post-service performance verification',
  'Fluid and tyre pressure top-up where applicable',
  'Digital service report attached to your booking',
]

const FALLBACK_WARRANTY =
  '90-day AutoCare workmanship warranty. If anything is not right after the service, we inspect and re-do it free of charge.'

function ServiceDetail({ serviceId, services = [], onBook, onNavigate }) {
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const fallbackService = services.find(
    (item) => String(item.id || item._id) === String(serviceId),
  ) || DEFAULT_SERVICES.find((item) => item.id === serviceId)

  useEffect(() => {
    let active = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError('')

    fetchService(serviceId)
      .then((result) => {
        if (!result) throw new Error('The requested service was not found.')
        if (active) setService(result)
      })
      .catch((requestError) => {
        console.error('[AutoCare] Failed to load service details:', requestError)
        if (active) {
          setError(
            getApiError(requestError, 'Unable to load this service right now.'),
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [serviceId, attempt])

  const goBack = () => onNavigate('home', 'services')
  const detail = service || fallbackService

  if (loading && !detail) {
    return (
      <div className="service-detail-page">
        <div className="container detail-loading">
          <span className="detail-spinner" aria-hidden="true" />
          <p>Loading service details…</p>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="detail-error" role="alert">
            <span className="detail-error-icon">
              <Wrench size={26} />
            </span>
            <h1>We couldn’t load this service</h1>
            <p>{error || 'Service details are not available right now.'}</p>
            <div className="detail-error-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setAttempt((current) => current + 1)}
              >
                <RotateCcw size={16} />
                Try again
              </button>
              <button type="button" className="btn btn-ghost" onClick={goBack}>
                <ArrowLeft size={16} />
                Back to services
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const features = detail.features?.length ? detail.features : FALLBACK_FEATURES
  const includedChecks = detail.includedChecks?.length
    ? detail.includedChecks
    : FALLBACK_CHECKS
  const warranty = detail.warranty || FALLBACK_WARRANTY
  const CategoryIcon = CATEGORY_ICONS[detail.category] || Wrench

  return (
    <div className="service-detail-page">
      <div className="container">
        {loading ? (
          <p className="detail-loading-note" role="status">
            Loading the latest service details…
          </p>
        ) : null}
        {!loading && error && fallbackService && !service ? (
          <p className="detail-loading-note" role="status">
            Live details are unavailable. Showing saved service information.
          </p>
        ) : null}
        <button type="button" className="detail-back" onClick={goBack}>
          <ArrowLeft size={15} />
          All services
        </button>

        <section className="detail-hero">
          <div className="detail-hero-media">
            <div className="detail-media-fallback" aria-hidden="true">
              <Car size={56} strokeWidth={1.1} />
            </div>
            {detail.image ? (
              <img
                src={detail.image}
                alt={`${detail.title} service`}
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <span className="detail-media-badge">
              <CategoryIcon size={13} />
              {CATEGORY_LABELS[detail.category] || detail.category}
            </span>
            {detail.badge ? (
              <span className="detail-media-flag">{detail.badge}</span>
            ) : null}
            <span className="detail-media-duration">
              <Clock size={13} />
              {detail.duration}
            </span>
          </div>

          <div className="detail-hero-copy">
            <span className="eyebrow">
              {CATEGORY_LABELS[detail.category] || detail.category}
            </span>
            <h1>{detail.title}</h1>
            <p className="detail-lead">{detail.description}</p>

            <div className="detail-meta">
              <span>
                <Clock size={15} />
                {detail.duration}
              </span>
              <span>
                <ShieldCheck size={15} />
                Warranty included
              </span>
              <span>
                <CarFront size={15} />
                Hatchback · Sedan · SUV
              </span>
            </div>

            <div className="detail-hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => onBook(detail)}
              >
                Book This Service
                <ArrowRight size={17} />
              </button>
              <button type="button" className="btn btn-ghost btn-lg" onClick={goBack}>
                Browse more services
              </button>
            </div>

            <p className="detail-hero-note">
              <MapPin size={13} />
              AutoCare Studio · Gulberg III, Lahore · No advance payment
            </p>
          </div>
        </section>

        <div className="detail-grid">
          <div className="detail-main">
            <section className="detail-panel">
              <div className="detail-panel-head">
                <span className="detail-panel-icon">
                  <BadgeCheck size={18} />
                </span>
                <div>
                  <h2>What’s included</h2>
                  <p>Everything covered when you book this package.</p>
                </div>
              </div>

              <ul className="detail-list">
                {features.map((feature) => (
                  <li key={feature}>
                    <span className="detail-check" aria-hidden="true">
                      <Check size={13} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <h3 className="detail-subhead">Inspection checklist</h3>
              <ul className="detail-list detail-list-checks">
                {includedChecks.map((item) => (
                  <li key={item}>
                    <span className="detail-check" aria-hidden="true">
                      <Check size={13} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <div className="detail-mini-grid">
              <section className="detail-panel detail-mini">
                <div className="detail-panel-head">
                  <span className="detail-panel-icon">
                    <Clock size={18} />
                  </span>
                  <div>
                    <h2>Estimated time</h2>
                    <p>Plan your day around the studio.</p>
                  </div>
                </div>
                <strong className="detail-mini-value">{detail.duration}</strong>
                <p className="detail-mini-note">
                  Drop-off 10 minutes before your slot. Free pickup and drop is
                  available within 5 km of the studio.
                </p>
              </section>

              <section className="detail-panel detail-mini">
                <div className="detail-panel-head">
                  <span className="detail-panel-icon">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h2>Warranty details</h2>
                    <p>Workmanship you can rely on.</p>
                  </div>
                </div>
                <p className="detail-warranty">{warranty}</p>
                <p className="detail-mini-note">
                  <Phone size={12} />
                  Questions? Call (042) 111 222 33.
                </p>
              </section>
            </div>
          </div>

          <aside className="detail-side">
            <section className="detail-price-card">
              <span className="eyebrow">Transparent price</span>
              <h2>{formatPrice(getStartingPrice(detail))}</h2>
              <span className="detail-price-caption">starting from</span>

              <div className="detail-price-list">
                {CAR_TYPES.map((type) => {
                  const Icon = CAR_ICONS[type.id] || Car
                  const price = detail.prices?.[type.id]
                  if (!price) return null
                  return (
                    <div className="detail-price-row" key={type.id}>
                      <span className="detail-price-label">
                        <Icon size={16} strokeWidth={1.8} />
                        <span>
                          {type.label}
                          <em>{type.examples}</em>
                        </span>
                      </span>
                      <strong>{formatPrice(price)}</strong>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                onClick={() => onBook(detail)}
              >
                Book This Service
                <ArrowRight size={17} />
              </button>

              <ul className="detail-price-perks">
                <li>
                  <Check size={13} />
                  No advance payment
                </li>
                <li>
                  <Check size={13} />
                  Final quote confirmed before work starts
                </li>
                <li>
                  <Check size={13} />
                  Free reschedule up to 4 hours before
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ServiceDetail
