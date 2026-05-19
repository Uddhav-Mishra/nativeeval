import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubmissions } from '../utils/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('dashboard_creds')
    if (stored) {
      const [u, p] = atob(stored).split(':')
      fetchSubmissions(u, p, stored)
    }
  }, [])

  async function fetchSubmissions(u, p, creds) {
    setLoading(true)
    setError('')
    try {
      const data = await getSubmissions(u, p)
      sessionStorage.setItem('dashboard_creds', creds || btoa(`${u}:${p}`))
      setSubmissions(data)
      setUnlocked(true)
    } catch (err) {
      if (err.message === '401') setError('Invalid credentials')
      else setError('Failed to load submissions')
      sessionStorage.removeItem('dashboard_creds')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!usernameInput || !passwordInput) { setError('Enter username and password'); return }
    await fetchSubmissions(usernameInput, passwordInput)
  }

  function getAvgScore(scorecard) {
    if (!scorecard?.scores) return null
    const vals = Object.values(scorecard.scores)
    if (!vals.length) return null
    return (vals.reduce((s, v) => s + (v.score || 0), 0) / vals.length).toFixed(1)
  }

  const scored = [...submissions].filter(s => s.status === 'scored' && s.scorecard?.scores)
  const ranked = scored.sort((a, b) => {
    const sa = parseFloat(getAvgScore(a.scorecard) || 0)
    const sb = parseFloat(getAvgScore(b.scorecard) || 0)
    return sb - sa
  })

  if (!unlocked) return (
    <div style={s.page}>
      <div style={s.loginCard}>
        <div style={s.eyebrow}>
          <div style={s.eyebrowLine} />
          <span style={s.eyebrowText}>Dashboard</span>
        </div>
        <h1 style={s.loginTitle}>NativeEval</h1>
        <p style={s.loginSub}>Enter your credentials to view all submissions.</p>
        <form onSubmit={handleLogin} style={s.loginForm}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Username</label>
            <input style={s.input} value={usernameInput} onChange={e => setUsernameInput(e.target.value)} autoComplete="username" autoFocus />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <div style={s.errorMsg}>{error}</div>}
          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? 'Loading…' : 'Enter →'}
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.dashContainer}>
        <div style={s.dashHeader}>
          <div>
            <div style={s.eyebrow}>
              <div style={s.eyebrowLine} />
              <span style={s.eyebrowText}>Candidate Rankings</span>
            </div>
            <h1 style={s.dashTitle}>NativeEval Dashboard</h1>
            <p style={s.dashSub}>{ranked.length} scored submission{ranked.length !== 1 ? 's' : ''}</p>
          </div>
          <button style={s.logoutBtn} onClick={() => { sessionStorage.removeItem('dashboard_creds'); setUnlocked(false); setSubmissions([]) }}>
            Sign out
          </button>
        </div>

        <div style={s.tableCard}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={{ ...s.th, width: '52px' }}>Rank</th>
                <th style={s.th}>Candidate</th>
                <th style={{ ...s.th, width: '80px' }}>Score</th>
                <th style={{ ...s.th, width: '100px' }}>Type</th>
                <th style={{ ...s.th, width: '120px' }}>Date</th>
                <th style={{ ...s.th, width: '80px' }}></th>
              </tr>
            </thead>
            <tbody>
              {ranked.length === 0 ? (
                <tr><td colSpan={6} style={s.empty}>No scored submissions yet.</td></tr>
              ) : ranked.map((sub, i) => (
                <tr
                  key={sub.id}
                  style={s.tr}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...s.td, textAlign: 'center', fontWeight: '700', color: i < 3 ? 'var(--gold)' : 'var(--text-muted)' }}>#{i + 1}</td>
                  <td style={{ ...s.td, fontWeight: '600', color: 'var(--text-head)' }}>{sub.candidate_name}</td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--navy)' }}>{getAvgScore(sub.scorecard)}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/10</span>
                  </td>
                  <td style={s.td}>
                    {sub.transcript_type && (
                      <span style={s.typeBadge}>{sub.transcript_type.toUpperCase()}</span>
                    )}
                  </td>
                  <td style={{ ...s.td, color: 'var(--text-muted)', fontSize: '12px' }}>
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td style={s.td}>
                    <button style={s.viewBtn} onClick={() => window.open(`/score/${sub.id}`, '_blank')}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-section)', padding: '40px 20px' },
  loginCard: { maxWidth: '400px', margin: '80px auto 0', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 24px rgba(10,22,40,0.08)', padding: '44px 40px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  loginTitle: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-head)', marginBottom: '8px' },
  loginSub: { fontSize: '14px', color: 'var(--text-body)', marginBottom: '28px', lineHeight: '1.5' },
  loginForm: { display: 'flex', flexDirection: 'column', gap: '0' },
  fieldGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' },
  input: { width: '100%', border: '1px solid var(--border)', borderRadius: '3px', padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--text-head)', background: 'var(--white)', outline: 'none' },
  errorMsg: { fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '3px', padding: '8px 12px', marginBottom: '12px' },
  submitBtn: { background: 'var(--navy)', color: 'var(--white)', border: 'none', borderRadius: '3px', padding: '13px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', marginTop: '8px' },
  dashContainer: { maxWidth: '960px', margin: '0 auto' },
  dashHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  dashTitle: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-head)', marginBottom: '4px' },
  dashSub: { fontSize: '14px', color: 'var(--text-muted)' },
  logoutBtn: { background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text-body)', borderRadius: '3px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  tableCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(10,22,40,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'var(--bg-light)', borderBottom: '1px solid var(--border)' },
  th: { padding: '12px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left' },
  tr: { borderBottom: '1px solid var(--border)', transition: 'background 0.15s', cursor: 'default' },
  td: { padding: '14px 16px', fontSize: '14px', color: 'var(--text-body)' },
  empty: { padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' },
  typeBadge: { fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', padding: '2px 8px', border: '1px solid var(--border)', borderRadius: '2px', color: 'var(--text-muted)' },
  viewBtn: { background: 'var(--navy)', color: 'var(--white)', border: 'none', borderRadius: '3px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
}
