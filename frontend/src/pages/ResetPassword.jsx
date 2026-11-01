import { useState } from 'react'
import { ArrowRight, Check, LockKeyhole } from 'lucide-react'
import { getApiError, resetPassword } from '../lib/api'

function ResetPassword({ token, onNavigate }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) return setError('This password reset link is missing or invalid.')
    if (password.length < 8 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setError('Password must be at least 8 characters and include a number and special character.')
    }
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    setError('')
    try {
      const response = await resetPassword(token, password)
      setMessage(response.message)
    } catch (requestError) {
      setError(getApiError(requestError, 'Unable to reset your password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <section className="auth-card">
          <div className="auth-intro">
            <span className="auth-lock"><LockKeyhole size={20} /></span>
            <span className="eyebrow">Secure account recovery</span>
            <h1>Set a new password.</h1>
            <p>Choose a strong password for your AutoCare account.</p>
          </div>
          {message ? (
            <div className="reset-success"><span><Check size={22} /></span><strong>{message}</strong><button type="button" className="btn btn-primary btn-block" onClick={() => onNavigate('auth')}>Go to login <ArrowRight size={16} /></button></div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field"><label htmlFor="reset-password">New password</label><div className="input-with-icon"><LockKeyhole size={16} /><input id="reset-password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="8+ chars, number & symbol" autoComplete="new-password" /></div></div>
              <div className="field"><label htmlFor="reset-confirm-password">Confirm password</label><div className="input-with-icon"><LockKeyhole size={16} /><input id="reset-confirm-password" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setError('') }} placeholder="Repeat your password" autoComplete="new-password" /></div></div>
              {error ? <p className="field-error" role="alert">{error}</p> : null}
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Updating…' : 'Reset Password'}{!loading ? <ArrowRight size={16} /> : null}</button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}

export default ResetPassword
