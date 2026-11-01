import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Car,
  CarFront,
  ClipboardList,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react'
import BookingModal from '../components/BookingModal'
import ServiceCard from '../components/ServiceCard'
import { SERVICE_CATEGORIES } from '../lib/data'

const FILTER_ICONS = {
  all: CarFront,
  'car-care': Sparkles,
  maintenance: Wrench,
}

const PROCESS_STEPS = [
  {
    icon: ClipboardList,
    number: '01',
    title: 'Choose your service',
    text: 'Compare real prices for hatchbacks, sedans and SUVs before you book. No surprises later.',
  },
  {
    icon: CalendarDays,
    number: '02',
    title: 'Pick your slot',
    text: 'Add your exact model, date and time. You get a booking reference instantly.',
  },
  {
    icon: BadgeCheck,
    number: '03',
    title: 'Drop off & relax',
    text: 'Track your car from Pending to Completed. We call before any work begins.',
  },
]

function Home({ services, user, onCreateBooking, onTrack, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedService, setSelectedService] = useState(null)

  const filteredServices = useMemo(() => {
    if (activeFilter === 'all') return services
    return services.filter((service) => service.category === activeFilter)
  }, [activeFilter, services])

  const countFor = (categoryId) =>
    categoryId === 'all'
      ? services.length
      : services.filter((service) => service.category === categoryId).length

  const scrollToServices = () => {
    document
      .getElementById('services')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBookService = (service) => {
    if (!user) {
      onNavigate('auth', 'services')
      return
    }
    setSelectedService(service)
  }

  return (
    <div className="home-page">
      <section className="hero-home">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          src="/hero-video.mp4"
          aria-label="AutoCare detailing studio video"
        />
        <div className="hero-video-overlay" aria-hidden="true" />
        <div className="hero-video-glow" aria-hidden="true" />

        <div className="container hero-grid">
          <div className="hero-copy hero-video-copy">
            <span className="eyebrow">
              <span className="live-dot" />
              Cars only · Precision care · Gulberg III, Lahore
            </span>
            <h1 className="hero-title">
              Smart service.
              <span className="text-gradient">Smoother drives.</span>
            </h1>
            <p className="hero-lead">
              A high-end detailing and maintenance studio built exclusively for
              cars. Transparent pricing, meticulous technicians, and a finish
              you can feel every time you drive.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={scrollToServices}
              >
                Book a Service
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => onNavigate('track')}
              >
                <Search size={16} />
                Track Booking
              </button>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>
                  <Star size={16} fill="currentColor" />
                  4.9/5
                </strong>
                <span>Customer rating</span>
              </div>
              <div className="hero-stat">
                <strong>12k+</strong>
                <span>Cars serviced</span>
              </div>
              <div className="hero-stat">
                <strong>45 min</strong>
                <span>Express wash</span>
              </div>
            </div>
          </div>

          <div className="hero-video-aside">
            <div className="hero-video-badge">
              <span className="hero-badge-icon"><ShieldCheck size={20} /></span>
              <span className="hero-badge-copy">
                <strong>Certified Workshop</strong>
                <small>100% Professional Care</small>
              </span>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="trust-strip">
            <div className="trust-item">
              <CarFront size={21} />
              <div>
                <strong>Cars only</strong>
                <span>Hatchback, sedan & SUV</span>
              </div>
            </div>
            <div className="trust-item">
              <BadgeCheck size={21} />
              <div>
                <strong>Genuine parts</strong>
                <span>OEM-grade consumables</span>
              </div>
            </div>
            <div className="trust-item">
              <ShieldCheck size={21} />
              <div>
                <strong>90-day warranty</strong>
                <span>On every mechanical job</span>
              </div>
            </div>
            <div className="trust-item">
              <MapPin size={21} />
              <div>
                <strong>Pickup & drop</strong>
                <span>Free within 5 km</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Service menu</span>
              <h2>
                Care for your car,{' '}
                <span className="text-red">priced clearly.</span>
              </h2>
              <p>
                Pick a package and see the exact starting price for your vehicle
                tier. Every job includes a complimentary inspection.
              </p>
            </div>
            <div className="section-meta">
              <strong>{filteredServices.length.toString().padStart(2, '0')}</strong>
              <span>Services shown</span>
            </div>
          </div>

          <div className="filter-bar">
            <div className="filter-pills">
              {SERVICE_CATEGORIES.map((category) => {
                const Icon = FILTER_ICONS[category.id] || Car
                return (
                  <button
                    type="button"
                    key={category.id}
                    className={`filter-pill${activeFilter === category.id ? ' is-active' : ''}`}
                    onClick={() => setActiveFilter(category.id)}
                    aria-pressed={activeFilter === category.id}
                  >
                    <Icon size={15} />
                    {category.label}
                    <span className="filter-count">{countFor(category.id)}</span>
                  </button>
                )
              })}
            </div>
            <div className="filter-note">
              <Car size={15} />
              Hatchback · Sedan · SUV only
            </div>
          </div>

          {filteredServices.length ? (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onBook={handleBookService}
                />
              ))}
            </div>
          ) : (
            <div className="services-empty">
              <span className="empty-icon">
                <Wrench size={26} />
              </span>
              <h3>No services in this category yet</h3>
              <p>
                Our team is updating this menu. Explore all services or call the
                studio for a custom quote.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveFilter('all')}
              >
                Show all services
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="section process-section">
        <div className="container">
          <div className="section-head process-head">
            <div>
              <span className="eyebrow">How it works</span>
              <h2>
                Three steps.{' '}
                <span className="text-silver">Zero friction.</span>
              </h2>
            </div>
            <p>
              From choosing a package to tracking your car, everything happens
              in one place.
            </p>
          </div>

          <div className="process-grid">
            {PROCESS_STEPS.map(({ icon: Icon, number, title, text }) => (
              <article className="process-card" key={number}>
                <span className="process-number">{number}</span>
                <span className="process-icon">
                  <Icon size={21} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-section">
        <div className="container">
          <div className="cta-band">
            <div className="cta-copy">
              <span className="eyebrow">Ready when you are</span>
              <h2>A smoother drive starts with one click.</h2>
              <p>
                Book in under a minute. No advance payment, no hidden charges —
                just precise car care.
              </p>
            </div>
            <div className="cta-actions">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={scrollToServices}
              >
                Book a Service
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-lg"
                onClick={() => onNavigate('track')}
              >
                <Clock size={16} />
                Track Booking
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedService ? (
          <BookingModal
            service={selectedService}
            services={services}
            onCreateBooking={onCreateBooking}
          onClose={() => setSelectedService(null)}
          onTrack={onTrack}
        />
      ) : null}
    </div>
  )
}

export default Home
