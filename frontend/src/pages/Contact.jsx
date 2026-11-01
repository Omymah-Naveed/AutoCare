import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Wrench,
} from 'lucide-react'
import { getApiError, submitContactMessage } from '../lib/api'

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

function Contact() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const result = await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      })
      setSuccess(result.message || 'Your message has been sent. We’ll be in touch soon.')
      setForm(INITIAL_FORM)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to send your message. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="container">
        <header className="contact-header">
          <span className="eyebrow"><MessageSquareText size={14} /> We’re here to help</span>
          <h1>Get in Touch with <span>AutoCare</span></h1>
          <p>
            Questions about your car, a service, or an upcoming visit? Send our
            Karachi team a message and we’ll be happy to help.
          </p>
        </header>

        <div className="contact-layout">
          <section className="contact-form-card">
            <div className="contact-card-heading">
              <span className="contact-heading-icon"><Send size={18} /></span>
              <div>
                <span className="eyebrow">Talk to our team</span>
                <h2>Send us a message</h2>
                <p>We typically respond during workshop hours.</p>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-grid">
                <div className="field">
                  <label htmlFor="contact-name">Customer name</label>
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-phone">Phone number</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                    value={form.phone}
                    onChange={(event) => updateField('phone', event.target.value)}
                    placeholder="+92 21 111 222 333"
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-subject">Subject</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    maxLength={140}
                    value={form.subject}
                    onChange={(event) => updateField('subject', event.target.value)}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="field contact-message-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    maxLength={3000}
                    value={form.message}
                    onChange={(event) => updateField('message', event.target.value)}
                    placeholder="Tell us a little more about what you need."
                    required
                  />
                </div>
              </div>

              {error ? <p className="contact-form-feedback is-error" role="alert">{error}</p> : null}
              {success ? <p className="contact-form-feedback is-success" role="status"><CheckCircle2 size={16} />{success}</p> : null}
              <button type="submit" className="btn btn-primary contact-submit" disabled={submitting}>
                {submitting ? 'Sending your message…' : 'Send message'}
                {submitting ? <span className="contact-submit-spinner" aria-hidden="true" /> : <ArrowRight size={16} />}
              </button>
              <p className="contact-form-note">Your details are only used to respond to your enquiry.</p>
            </form>
          </section>

          <aside className="contact-side">
            <article className="contact-info-card">
              <span className="contact-info-icon"><MapPin size={19} /></span>
              <div>
                <span className="contact-info-label">Visit the workshop</span>
                <h2>Karachi, Pakistan</h2>
                <p>Contact our team for directions and appointment availability.</p>
              </div>
            </article>

            <article className="contact-info-card">
              <span className="contact-info-icon"><Phone size={19} /></span>
              <div>
                <span className="contact-info-label">Call our team</span>
                <a href="tel:+9221111222333" className="contact-info-value">(021) 111 222 333</a>
                <a href="mailto:support@autocare.com" className="contact-info-link">
                  <Mail size={14} />
                  support@autocare.com
                </a>
              </div>
            </article>

            <article className="contact-info-card">
              <span className="contact-info-icon"><Clock3 size={19} /></span>
              <div>
                <span className="contact-info-label">Business hours</span>
                <h2>Mon–Sat</h2>
                <p>9:00 AM – 9:00 PM</p>
              </div>
            </article>

            <section className="contact-map-card" aria-label="AutoCare Karachi location">
              <div className="contact-map-art" aria-hidden="true">
                <span className="contact-map-road contact-map-road-one" />
                <span className="contact-map-road contact-map-road-two" />
                <span className="contact-map-road contact-map-road-three" />
                <span className="contact-map-pin"><MapPin size={21} fill="currentColor" /></span>
                <span className="contact-map-label">KARACHI</span>
              </div>
              <div className="contact-map-caption">
                <span><Wrench size={15} /> AutoCare Service Center</span>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=AutoCare+car+service+center+Karachi+Pakistan"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps
                  <ArrowRight size={13} />
                </a>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default Contact
