import { useEffect, useState } from 'react'
import { CalendarDays, Camera, Download, Mail, Save, UserRound, XCircle } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { cancelBooking, fetchMyBookings, fetchProfile, getApiError, updateProfile } from '../lib/api'
import { formatDate, formatPrice } from '../lib/data'
import { generateServiceReportPDF } from '../lib/pdf'

function CustomerProfile({ user, onProfileUpdated, onNavigate }) {
  const [profile, setProfile] = useState(user || {})
  const [bookings, setBookings] = useState([])
  const [name, setName] = useState(user?.name || '')
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState('')

  useEffect(() => {
    Promise.all([fetchProfile(), fetchMyBookings()])
      .then(([account, history]) => {
        setProfile(account)
        setName(account.name || '')
        setBookings(history)
        onProfileUpdated(account)
      })
      .catch((requestError) => setError(getApiError(requestError, 'Unable to load your profile.')))
      .finally(() => setLoading(false))
  }, [onProfileUpdated])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (name.trim().length < 2) {
      setError('Please enter a valid name.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const updated = await updateProfile({ name: name.trim(), profilePicture: imageFile })
      setProfile(updated)
      setImageFile(null)
      onProfileUpdated(updated)
      setMessage('Profile updated successfully.')
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to update your profile.'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancelBooking = async (booking) => {
    if (booking.status !== 'Pending' || cancellingId) return
    if (!window.confirm(`Cancel booking #${booking.id}?`)) return

    setCancellingId(booking.id)
    setError('')
    try {
      const cancelledBooking = await cancelBooking(booking.id)
      setBookings((current) => current.map((item) => item.id === cancelledBooking.id ? cancelledBooking : item))
      setMessage('Booking cancelled successfully. You can still download its report.')
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to cancel this booking.'))
    } finally {
      setCancellingId('')
    }
  }

  if (loading) {
    return <div className="profile-page"><div className="container profile-loading">Loading your profile…</div></div>
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-heading">
          <div>
            <span className="eyebrow">Your AutoCare account</span>
            <h1>Profile & <span className="text-red">service history.</span></h1>
            <p>Keep your details current and see every car care visit in one place.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onNavigate('home', 'services')}>Browse services</button>
        </div>

        <div className="profile-layout">
          <section className="panel profile-card">
            <div className="profile-card-head">
              <span className="profile-avatar-large">
                {profile.profilePicture ? <img src={profile.profilePicture} alt={profile.name} /> : <UserRound size={34} />}
              </span>
              <div>
                <h2>Account details</h2>
                <p>Update your name or profile picture.</p>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-upload">
                <label htmlFor="profile-picture" className="profile-file-label">
                  <Camera size={16} />
                  Choose profile picture
                </label>
                <input id="profile-picture" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
                <small>{imageFile ? imageFile.name : 'PNG, JPG or WEBP · Max 5 MB'}</small>
              </div>

              <div className="field">
                <label htmlFor="profile-name">Full name</label>
                <div className="input-with-icon"><UserRound size={16} /><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} /></div>
              </div>
              <div className="field">
                <label htmlFor="profile-email">Email address</label>
                <div className="input-with-icon"><Mail size={16} /><input id="profile-email" value={profile.email || ''} readOnly /></div>
              </div>

              {error ? <p className="field-error" role="alert">{error}</p> : null}
              {message ? <p className="profile-success" role="status">{message}</p> : null}
              <button type="submit" className="btn btn-primary" disabled={saving}><Save size={15} />{saving ? 'Saving…' : 'Save profile'}</button>
            </form>
          </section>

          <section className="panel history-card">
            <div className="profile-card-head">
              <span className="profile-section-icon"><CalendarDays size={20} /></span>
              <div><h2>Booking history</h2><p>{bookings.length} service booking{bookings.length === 1 ? '' : 's'}</p></div>
            </div>
            {bookings.length ? (
              <div className="history-list">
                {bookings.map((booking) => (
                  <article className="history-item" key={booking.id}>
                    <div><strong>{booking.serviceTitle}</strong><span>#{booking.id} · {booking.model}</span></div>
                    <div className="history-meta"><span>{formatDate(booking.date)} · {booking.time}</span><strong>{formatPrice(booking.amount)}</strong><StatusBadge status={booking.status} />{booking.status === 'Cancelled' && booking.cancellationReason ? <span className="history-cancellation-reason">Reason: {booking.cancellationReason}</span> : null}{booking.status === 'Pending' ? <button type="button" className="btn btn-danger-outline btn-sm history-cancel" onClick={() => handleCancelBooking(booking)} disabled={cancellingId === booking.id}><XCircle size={13} />{cancellingId === booking.id ? 'Cancelling…' : 'Cancel Booking'}</button> : null}<button type="button" className="btn btn-ghost btn-sm history-download" onClick={() => generateServiceReportPDF(booking, profile)}><Download size={13} /> Download Report</button></div>
                  </article>
                ))}
              </div>
            ) : <div className="history-empty"><CalendarDays size={24} /><strong>No bookings yet</strong><span>Your completed and upcoming services will appear here.</span></div>}
          </section>
        </div>
      </div>
    </div>
  )
}

export default CustomerProfile
