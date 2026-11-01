import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Car,
  CarFront,
  Check,
  ClipboardList,
  Clock,
  Copy,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  User,
  X,
} from 'lucide-react'
import { fetchSlotAvailability, getApiError } from '../lib/api'
import {
  CAR_TYPES,
  CATEGORY_LABELS,
  TIME_SLOTS,
  formatDate,
  formatPrice,
  toISODate,
} from '../lib/data'

const CAR_ICONS = {
  hatchback: CarFront,
  sedan: Car,
  suv: Truck,
}

const STEPS = ['Vehicle', 'Schedule', 'Details']

function BookingModal({ service, services = [], onCreateBooking, onClose, onTrack }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    carType: '',
    model: '',
    date: '',
    time: '',
    name: '',
    phone: '',
  })
  const [errors, setErrors] = useState({})
  const [createdBooking, setCreatedBooking] = useState(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedServiceIds, setSelectedServiceIds] = useState([service.id])
  const [availability, setAvailability] = useState(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const dialogRef = useRef(null)

  const selectedType = CAR_TYPES.find((type) => type.id === form.carType)
  const selectedServices = services.filter((item) => selectedServiceIds.includes(item.id))
  const primaryService = selectedServices[0] || service
  const price = form.carType
    ? selectedServices.reduce((total, item) => total + Number(item.prices[form.carType] || 0), 0)
    : null
  const today = toISODate(new Date())

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  useEffect(() => {
    if (!form.date) {
      return
    }

    let active = true
    // Fetch availability whenever the selected date changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailabilityLoading(true)
    setAvailabilityError('')
    fetchSlotAvailability(form.date)
      .then((result) => {
        if (active) setAvailability(result)
      })
      .catch((error) => {
        if (active) setAvailabilityError(getApiError(error, 'Unable to load slot availability.'))
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false)
      })

    return () => {
      active = false
    }
  }, [form.date])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const toggleService = (serviceId) => {
    setSelectedServiceIds((current) => current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId])
    setErrors((current) => ({ ...current, services: undefined }))
  }

  const validate = () => {
    const nextErrors = {}

    if (step === 1 && !selectedServiceIds.length) {
      nextErrors.services = 'Select at least one service to continue.'
    }
    if (step === 1 && !form.carType) {
      nextErrors.carType = 'Select your car type to continue.'
    }

    if (step === 2) {
      if (form.model.trim().length < 2) {
        nextErrors.model = 'Enter the exact vehicle model.'
      }
      if (!form.date) {
        nextErrors.date = 'Choose an appointment date.'
      } else if (form.date < today) {
        nextErrors.date = 'The appointment date cannot be in the past.'
      }
      if (!form.time) {
        nextErrors.time = 'Choose a preferred time slot.'
      }
    }

    if (step === 3) {
      if (form.name.trim().length < 3) {
        nextErrors.name = 'Enter your full name.'
      }
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 13) {
        nextErrors.phone = 'Enter a valid phone number (10–13 digits).'
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = async () => {
    if (!validate()) return

    if (step < 3) {
      setStep((current) => current + 1)
      setErrors({})
      return
    }

    setSubmitting(true)
    try {
      const booking = await onCreateBooking({
        serviceId: selectedServices[0].id,
        serviceTitle: selectedServices.map((item) => item.title).join(' + '),
        serviceImage: primaryService.image,
        category: primaryService.category,
        carType: form.carType,
        carTypeLabel: selectedType?.label || form.carType,
        model: form.model.trim(),
        date: form.date,
        time: form.time,
        name: form.name.trim(),
        phone: form.phone.trim(),
        amount: price,
        services: selectedServices.map((item) => item.id),
      })
      setCreatedBooking(booking)
    } catch (error) {
      setErrors({ submit: getApiError(error, 'Unable to create booking. Please try again.') })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    setStep((current) => Math.max(1, current - 1))
    setErrors({})
  }

  const isSlotFull = (slot) => availability?.slots?.[slot] >= (availability?.capacity || 3)

  const copyBookingId = async () => {
    if (!createdBooking) return
    try {
      await navigator.clipboard.writeText(`#${createdBooking.id}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close booking modal"
        >
          <X size={18} />
        </button>

        {createdBooking ? (
          <div className="success-screen">
            <div className="success-icon">
              <Check size={34} strokeWidth={2.4} />
            </div>
            <span className="eyebrow">Booking confirmed</span>
            <h2 id="booking-modal-title">
              You’re all set, {createdBooking.name.split(' ')[0]}.
            </h2>
            <p>
              Your slot is reserved. Our service advisor will call you shortly
              to confirm the details.
            </p>

            <button
              type="button"
              className="booking-ref"
              onClick={copyBookingId}
              title="Copy booking reference"
            >
              #{createdBooking.id}
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <span className="copy-hint">
              {copied ? 'Reference copied' : 'Tap to copy your reference'}
            </span>

            <div className="success-summary">
              <div className="success-row">
                <span>Service</span>
                <strong>{createdBooking.serviceTitle}</strong>
              </div>
              <div className="success-row">
                <span>Vehicle</span>
                <strong>
                  {createdBooking.carTypeLabel} · {createdBooking.model}
                </strong>
              </div>
              <div className="success-row">
                <span>Schedule</span>
                <strong>
                  {formatDate(createdBooking.date)} · {createdBooking.time}
                </strong>
              </div>
              <div className="success-row">
                <span>Studio</span>
                <strong>AutoCare, Gulberg III</strong>
              </div>
              <div className="success-row success-row-total">
                <span>Estimated total</span>
                <strong>{formatPrice(createdBooking.amount)}</strong>
              </div>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onTrack(createdBooking.id)}
              >
                <ClipboardList size={16} />
                Track Booking
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Done
              </button>
            </div>
            <p className="success-note">
              <Phone size={13} />
              Need to change something? Call (042) 111 222 33.
            </p>
          </div>
        ) : (
          <>
            <div className="modal-head">
              <span className="eyebrow">Book your service</span>
              <h2 id="booking-modal-title">{service.title}</h2>
              <p>
                {CATEGORY_LABELS[service.category] || service.category} ·{' '}
                {service.duration} · Cars only
              </p>
            </div>

            <div className="stepper" aria-label="Booking progress">
              {STEPS.map((label, index) => {
                const number = index + 1
                const state =
                  number < step
                    ? 'is-done'
                    : number === step
                      ? 'is-active'
                      : ''
                return (
                  <div className={`stepper-step ${state}`} key={label}>
                    <span className="step-dot">
                      {number < step ? <Check size={13} /> : number}
                    </span>
                    <span className="stepper-label">{label}</span>
                  </div>
                )
              })}
            </div>

            <div className="modal-layout">
              <div className="modal-main">
                {step === 1 ? (
                  <div className="step-panel" key="step-1">
                     <h3>Select services and your car type</h3>
                     <p className="step-sub">
                       Add multiple services to one appointment. Pricing adjusts instantly to your vehicle size.
                     </p>

                     <div className="service-select-list" role="group" aria-label="Services">
                       {services.map((item) => {
                         const selected = selectedServiceIds.includes(item.id)
                         return (
                           <button type="button" role="checkbox" aria-checked={selected} key={item.id} className={`service-select-option${selected ? ' is-selected' : ''}`} onClick={() => toggleService(item.id)}>
                             <span className="service-select-check">{selected ? <Check size={13} /> : null}</span>
                             <span className="service-select-copy"><strong>{item.title}</strong><small>{item.duration}</small></span>
                             <strong className="service-select-price">{form.carType ? formatPrice(item.prices[form.carType]) : 'Select car'}</strong>
                           </button>
                         )
                       })}
                     </div>
                     {errors.services ? <p className="field-error" role="alert">{errors.services}</p> : null}

                     <div className="car-options" role="radiogroup" aria-label="Car type">
                      {CAR_TYPES.map((type) => {
                         const Icon = CAR_ICONS[type.id] || Car
                         const isSelected = form.carType === type.id
                         const tierTotal = selectedServices.reduce(
                           (total, item) => total + Number(item.prices[type.id] || 0),
                           0,
                         )
                         return (
                          <button
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            key={type.id}
                            className={`car-option${isSelected ? ' is-selected' : ''}`}
                            onClick={() => updateField('carType', type.id)}
                          >
                            <span className="car-option-icon">
                              <Icon size={24} strokeWidth={1.7} />
                            </span>
                            <span className="car-option-info">
                              <strong>{type.label}</strong>
                              <small>{type.examples}</small>
                            </span>
                            <span className="car-option-price">
                              {formatPrice(tierTotal)}
                            </span>
                            <span className="car-radio" aria-hidden="true" />
                          </button>
                        )
                      })}
                    </div>
                    {errors.carType ? (
                      <p className="field-error" role="alert">
                        {errors.carType}
                      </p>
                    ) : null}
                    <p className="step-hint">
                      <Info size={14} />
                      Hatchback pricing covers Alto, Cultus and WagonR. SUV
                      pricing applies to crossovers as well.
                    </p>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="step-panel" key="step-2">
                    <h3>Pick a date and time</h3>
                    <p className="step-sub">
                      Live slots for the AutoCare studio in Gulberg III.
                    </p>

                    <div className="schedule-grid">
                      <div className="field">
                        <label htmlFor="booking-model">Vehicle model</label>
                        <input
                          id="booking-model"
                          type="text"
                          placeholder="e.g. Honda Civic 2022"
                          value={form.model}
                          onChange={(event) =>
                            updateField('model', event.target.value)
                          }
                          autoComplete="off"
                          aria-invalid={Boolean(errors.model)}
                        />
                        {errors.model ? (
                          <span className="field-error">{errors.model}</span>
                        ) : null}
                      </div>

                      <div className="field">
                        <label htmlFor="booking-date">Appointment date</label>
                        <div className="input-with-icon">
                          <CalendarDays size={16} />
                          <input
                            id="booking-date"
                            type="date"
                            min={today}
                            value={form.date}
                            onChange={(event) => {
                              updateField('date', event.target.value)
                              updateField('time', '')
                            }}
                            aria-invalid={Boolean(errors.date)}
                          />
                        </div>
                        {errors.date ? (
                          <span className="field-error">{errors.date}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="field slot-field">
                      <span className="field-label">Preferred time slot</span>
                      <div className="slot-grid" role="radiogroup" aria-label="Time slot">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            type="button"
                            role="radio"
                              aria-checked={form.time === slot}
                            disabled={!form.date || availabilityLoading || isSlotFull(slot)}
                            key={slot}
                            className={`slot${form.time === slot ? ' is-selected' : ''}${isSlotFull(slot) ? ' is-full' : ''}`}
                            onClick={() => updateField('time', slot)}
                          >
                            <span>{slot}</span>
                            {isSlotFull(slot) ? <small>Full</small> : null}
                          </button>
                        ))}
                      </div>
                {errors.time ? (
                        <span className="field-error">{errors.time}</span>
                      ) : null}
                    </div>

                    <p className="step-hint">
                      <Clock size={14} />
                      Drop-off 10 minutes before your slot. Free pickup and drop
                      is available within 5 km.
                    </p>
                  </div>
                ) : null}
                      {availabilityError ? <span className="field-error">{availabilityError}</span> : null}

                {step === 3 ? (
                  <div className="step-panel" key="step-3">
                    <h3>Your contact details</h3>
                    <p className="step-sub">
                      We only use these details to confirm your booking.
                    </p>

                    <div className="customer-grid">
                      <div className="field">
                        <label htmlFor="booking-name">Full name</label>
                        <div className="input-with-icon">
                          <User size={16} />
                          <input
                            id="booking-name"
                            type="text"
                            placeholder="e.g. Ahmed Khan"
                            value={form.name}
                            onChange={(event) =>
                              updateField('name', event.target.value)
                            }
                            autoComplete="name"
                            aria-invalid={Boolean(errors.name)}
                          />
                        </div>
                        {errors.name ? (
                          <span className="field-error">{errors.name}</span>
                        ) : null}
                      </div>

                      <div className="field">
                        <label htmlFor="booking-phone">Phone number</label>
                        <div className="input-with-icon">
                          <Phone size={16} />
                          <input
                            id="booking-phone"
                            type="tel"
                            placeholder="0300 1234567"
                            value={form.phone}
                            onChange={(event) =>
                              updateField('phone', event.target.value)
                            }
                            autoComplete="tel"
                            inputMode="tel"
                            aria-invalid={Boolean(errors.phone)}
                          />
                        </div>
                        {errors.phone ? (
                          <span className="field-error">{errors.phone}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="assurance">
                      <span className="assurance-icon">
                        <ShieldCheck size={18} />
                      </span>
                      <div>
                        <strong>No advance payment required</strong>
                        <p>
                          Pay at the studio after the service. Your quote is
                          confirmed before any work begins.
                        </p>
                      </div>
                    </div>

                    <div className="assurance assurance-soft">
                      <span className="assurance-icon">
                        <BadgeCheck size={18} />
                      </span>
                      <div>
                        <strong>What happens next?</strong>
                        <p>
                          You’ll receive a call within 15 minutes to confirm
                          your appointment and slot.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="booking-summary" aria-label="Booking summary">
                <div className="summary-media">
                  <img
                     src={primaryService.image}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                  <span className="summary-media-label">
                     {CATEGORY_LABELS[primaryService.category] || primaryService.category}
                  </span>
                </div>
                <div className="summary-body">
                  <span className="summary-category">Your selection</span>
                   <h4>{selectedServices.map((item) => item.title).join(' + ') || service.title}</h4>
                  <div className="summary-rows">
                    <div className="summary-row">
                      <span>Car type</span>
                      <strong>{selectedType?.label || 'Not selected'}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Vehicle</span>
                      <strong>{form.model.trim() || '—'}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Date</span>
                      <strong>{form.date ? formatDate(form.date) : '—'}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Time</span>
                      <strong>{form.time || '—'}</strong>
                    </div>
                  </div>
                  <div className="summary-total">
                    <span>Estimated total</span>
                    <strong key={price} className="price-value">
                      {price ? formatPrice(price) : 'Select car'}
                    </strong>
                  </div>
                  <p className="summary-note">
                    <MapPin size={12} />
                    AutoCare Studio · Gulberg III, Lahore
                  </p>
                </div>
              </aside>
            </div>

            {errors.submit ? <p className="field-error modal-submit-error" role="alert">{errors.submit}</p> : null}
            <div className="modal-actions">
              <span className="modal-progress">Step {step} of 3</span>
              <div className="modal-actions-right">
                {step > 1 ? (
                  <button type="button" className="btn btn-ghost" onClick={handleBack}>
                    <ArrowLeft size={15} />
                    Back
                  </button>
                ) : null}
                <button type="button" className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                  {submitting ? 'Saving…' : step === 3 ? 'Confirm Booking' : 'Continue'}
                  {!submitting && step === 3 ? (
                    <Check size={16} />
                  ) : !submitting ? (
                    <ArrowRight size={16} />
                  ) : null}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BookingModal
