import { useState } from 'react'
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react'
import { getApiError, requestPasswordReset } from '../lib/api'

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await requestPasswordReset(email.trim().toLowerCase())
      setMessage(response.message)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to send the reset link.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <section className="auth-card">
          <div className="auth-intro">
            <span className="auth-lock"><Mail size={20} /></span>
            <span className="eyebrow">Account recovery</span>
            <h1>Forgot your password?</h1>
            <p>Enter your account email and we’ll send a secure reset link.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="forgot-email">Email address</label>
              <div className="input-with-icon"><Mail size={16} /><input id="forgot-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="you@example.com" autoComplete="email" /></div>
            </div>
            {error ? <p className="field-error" role="alert">{error}</p> : null}
            {message ? <p className="profile-success" role="status">{message}</p> : null}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading || Boolean(message)}>
              {loading ? 'Sending…' : 'Send Reset Link'}
              {!loading ? <ArrowRight size={16} /> : null}
            </button>
          </form>
          <button type="button" className="auth-back auth-back-row" onClick={() => onNavigate('auth')}><ArrowLeft size={14} /> Back to login</button>
        </section>
      </div>
    </div>
  )
}

export default ForgotPassword
