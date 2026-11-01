import { ArrowRight, Car, CarFront, Clock, Truck } from 'lucide-react'
import {
  CAR_TYPES,
  CATEGORY_LABELS,
  formatPrice,
  getStartingPrice,
} from '../lib/data'

const CAR_ICONS = {
  hatchback: CarFront,
  sedan: Car,
  suv: Truck,
}

function ServiceCard({ service, onBook, onView }) {
  return (
    <article className="service-card">
      <div className="service-media">
        <div className="service-media-fallback" aria-hidden="true">
          <Car size={44} strokeWidth={1.2} />
        </div>
        <img
          src={service.image}
          alt={`${service.title} service`}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
        <span className="service-category">
          {CATEGORY_LABELS[service.category] || service.category}
        </span>
        {service.badge ? (
          <span className="service-badge">{service.badge}</span>
        ) : null}
        <span className="service-duration">
          <Clock size={12} />
          {service.duration}
        </span>
        <button
          type="button"
          className="service-media-link"
          onClick={() => onView(service)}
          aria-label={`View details for ${service.title}`}
        />
      </div>

      <div className="service-body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>

        <div className="price-list" aria-label="Price by car type">
          {Object.entries(service.prices).map(([carType, price]) => {
            const Icon = CAR_ICONS[carType] || Car
            const type = CAR_TYPES.find((item) => item.id === carType)
            const label =
              type?.label ||
              (carType === 'suv'
                ? 'SUV / Crossover'
                : carType.charAt(0).toUpperCase() + carType.slice(1))
            const examples = type?.examples

            return (
              <div className="price-row" key={carType}>
                <span className="tier-label">
                  <Icon size={16} strokeWidth={1.8} />
                  <span>
                    {label}
                    {examples ? <em>{examples}</em> : null}
                  </span>
                </span>
                <strong>{formatPrice(price)}</strong>
              </div>
            )
          })}
        </div>

        <div className="service-footer">
          <div className="service-from">
            <span>Starting from</span>
            <strong>{formatPrice(getStartingPrice(service))}</strong>
          </div>
          <div className="service-card-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm service-view-btn"
              onClick={() => onView(service)}
            >
              View Details
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onBook(service)}
            >
              Book Now
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ServiceCard
