import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSubmissions } from '../utils/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from || '/results'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) { setError('Enter username and password'); return }
    setLoading(true)
    setError('')
    try {
      await getSubmissions(username, password)
      sessionStorage.setItem('dashboard_creds', btoa(`${username}:${password}`))
      navigate(from, { replace: true })
    } catch (err) {
      if (err.message === '401') setError('Invalid credentials')
      else setError('Could not connect. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.eyebrow}>
          <div style={s.eyebrowLine} />
          <span style={s.eyebrowText}>Access Required</span>
        </div>
        <h1 style={s.title}>NativeEval</h1>
        <p style={s.subtitle}>Sign in to view candidate scorecards.</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input
              style={s.input}
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <div style={s.errorMsg}>{error}</div>}
          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { width: '100%', maxWidth: '400px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(10,22,40,0.08)', padding: '44px 40px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  title: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-head)', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: 'var(--text-body)', marginBottom: '28px', lineHeight: 1.5 },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
  fieldGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' },
  input: { width: '100%', border: '1px solid var(--border)', borderRadius: '3px', padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--text-head)', background: 'var(--white)', outline: 'none', boxSizing: 'border-box' },
  errorMsg: { fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '3px', padding: '8px 12px', marginBottom: '12px' },
  submitBtn: { background: 'var(--navy)', color: 'var(--white)', border: 'none', borderRadius: '3px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' },
}
