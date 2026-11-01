import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { getApiError, login, signup } from '../lib/api'

function LoginSignup({ onSuccess, onNavigate }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const email = form.email.trim().toLowerCase()

    if (mode === 'signup' && form.name.trim().length < 2) {
      setError('Please enter your name.')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 8 || !/\d/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      setError('Password must be at least 8 characters and include a number and special character.')
      return
    }

    setSubmitting(true)
    try {
      const response = mode === 'signup'
        ? await signup({ name: form.name.trim(), email, password: form.password })
        : await login({ email, password: form.password })
      onSuccess(response.user, response.token)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to authenticate. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <section className="auth-card">
          <div className="auth-intro">
            <span className="auth-lock"><LockKeyhole size={20} /></span>
            <span className="eyebrow">AutoCare account</span>
            <h1>{mode === 'login' ? 'Welcome back.' : 'Join the drive.'}</h1>
            <p>
              {mode === 'login'
                ? 'Sign in to keep your bookings and service history close.'
                : 'Create an account for faster bookings and easy tracking.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setError('') }}>
              Login
            </button>
            <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => { setMode('signup'); setError('') }}>
              Signup
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' ? (
              <div className="field">
                <label htmlFor="auth-name">Full name</label>
                <div className="input-with-icon"><UserRound size={16} /><input id="auth-name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ahmed Khan" autoComplete="name" /></div>
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="auth-email">Email address</label>
              <div className="input-with-icon"><Mail size={16} /><input id="auth-email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
            </div>
            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <div className="input-with-icon"><LockKeyhole size={16} /><input id="auth-password" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="8+ chars, number & symbol" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div>
            </div>
            {error ? <p className="field-error" role="alert">{error}</p> : null}
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Continue to services' : 'Create account'}
              {!submitting ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <p className="auth-note">Cars only · Secure booking experience · Gulberg III, Lahore</p>
          {mode === 'login' ? <button type="button" className="auth-forgot" onClick={() => onNavigate('forgot')}>Forgot password?</button> : null}
          <button type="button" className="auth-back" onClick={() => onNavigate('home')}>Continue as guest</button>
        </section>
      </div>
    </div>
  )
}

export default LoginSignup
