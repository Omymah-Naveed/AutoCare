import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CarFront,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wrench,
} from 'lucide-react'
import { fetchAboutContent, getApiError } from '../lib/api'

const EMPTY_ABOUT = {
  companyName: 'AutoCare',
  tagline: 'Smart Service, Smoother Drives.',
  story: 'We are a car-only care studio built around transparent advice, skilled hands, and service that respects your time.',
  mission: 'Make dependable car care straightforward, transparent, and convenient for every driver.',
  vision: 'Set a higher standard for the way drivers experience vehicle care.',
  stats: {
    yearsExperience: 0,
    carsServiced: 0,
    expertTechnicians: 0,
    customerRating: 0,
  },
  teamMembers: [],
}

function formatStat(value) {
  const number = Number(value)
  if (!Number.isFinite(number) || number <= 0) return '—'
  return new Intl.NumberFormat('en').format(number)
}

function About({ onNavigate }) {
  const [about, setAbout] = useState(EMPTY_ABOUT)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    fetchAboutContent()
      .then((result) => {
        if (!result || typeof result !== 'object') {
          throw new Error('About information returned by the server is invalid.')
        }
        if (active) {
          setAbout({
            ...EMPTY_ABOUT,
            ...result,
            stats: { ...EMPTY_ABOUT.stats, ...result.stats },
            teamMembers: Array.isArray(result.teamMembers) ? result.teamMembers : [],
          })
        }
      })
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, 'Unable to load About AutoCare.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [retry])

  const stats = [
    { key: 'yearsExperience', label: 'Years of experience', suffix: '+', icon: Sparkles },
    { key: 'carsServiced', label: 'Cars serviced', suffix: '+', icon: CarFront },
    { key: 'expertTechnicians', label: 'Expert technicians', suffix: '', icon: Wrench },
    { key: 'customerRating', label: 'Customer rating', suffix: '/5', icon: BadgeCheck },
  ]
  const hasStats = stats.some(({ key }) => Number(about.stats?.[key]) > 0)

  return (
    <div className="about-page">
      <div className="container">
        <header className="about-hero">
          <img
            className="about-brand-logo"
            src="/AutoCareLogoTagline.png"
            alt="AutoCare — Smart Service, Smoother Drives."
          />
          <span className="eyebrow"><Building2 size={14} /> The AutoCare story</span>
          <h1>About <span>{about.companyName || 'AutoCare'}.</span></h1>
          <p className="about-tagline">{about.tagline}</p>
          {loading ? (
            <div className="about-loading" role="status">Loading our story…</div>
          ) : error ? (
            <div className="about-load-error" role="alert">
              <span>{error}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setLoading(true)
                  setError('')
                  setRetry((value) => value + 1)
                }}
              >
                Try again
              </button>
            </div>
          ) : (
            <p className="about-story">{about.story}</p>
          )}
        </header>

        {!loading && !error ? (
          <>
            {hasStats ? (
              <section className="about-stats" aria-label="AutoCare at a glance">
                {stats.filter(({ key }) => Number(about.stats?.[key]) > 0).map(({ key, label, suffix, icon: Icon }) => (
                  <article className="about-stat-card" key={key}>
                    <span className="about-stat-icon"><Icon size={18} /></span>
                    <strong>{formatStat(about.stats[key])}{suffix}</strong>
                    <span>{label}</span>
                  </article>
                ))}
              </section>
            ) : null}

            <section className="about-purpose-grid" aria-label="Our purpose">
              <article className="about-purpose-card">
                <span className="about-purpose-icon"><Target size={19} /></span>
                <span className="eyebrow">Our mission</span>
                <h2>Care with purpose.</h2>
                <p>{about.mission}</p>
              </article>
              <article className="about-purpose-card about-purpose-card-highlight">
                <span className="about-purpose-icon"><HeartHandshake size={19} /></span>
                <span className="eyebrow">Our vision</span>
                <h2>Confidence for every drive.</h2>
                <p>{about.vision}</p>
              </article>
              <article className="about-purpose-card">
                <span className="about-purpose-icon"><ShieldCheck size={19} /></span>
                <span className="eyebrow">Our promise</span>
                <h2>Honest work, clearly explained.</h2>
                <p>Thoughtful recommendations, skilled service, and a smoother experience from booking to pickup.</p>
              </article>
            </section>

            {about.teamMembers.length ? (
              <section className="about-team-section">
                <div className="about-section-heading">
                  <span className="eyebrow"><Users size={14} /> The people behind the care</span>
                  <h2>Meet our <span>team.</span></h2>
                  <p>Dedicated people bringing care and craftsmanship to every visit.</p>
                </div>
                <div className="about-team-grid">
                  {about.teamMembers.map((member) => (
                    <article className="about-team-card" key={member._id || `${member.name}-${member.role}`}>
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} loading="lazy" />
                      ) : (
                        <div className="about-team-avatar" aria-hidden="true">
                          <Wrench size={24} />
                        </div>
                      )}
                      <div>
                        <h3>{member.name}</h3>
                        <span>{member.role}</span>
                        {member.bio ? <p>{member.bio}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="about-cta">
              <div>
                <span className="eyebrow">Your car is in good hands</span>
                <h2>Let’s make your next visit easier.</h2>
                <p>Talk to our team or find the right care for your car.</p>
              </div>
              <div className="about-cta-actions">
                <button type="button" className="btn btn-primary" onClick={() => onNavigate('contact')}>
                  Contact us <ArrowRight size={15} />
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => onNavigate('home', 'services')}>
                  Explore services
                </button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default About
