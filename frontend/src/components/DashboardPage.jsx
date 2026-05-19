import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubmissions } from '../utils/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('dashboard_creds')
    const [u, p] = atob(stored).split(':')
    getSubmissions(u, p)
      .then(data => { setSubmissions(data); setLoading(false) })
      .catch(() => { setError('Failed to load submissions'); setLoading(false) })
  }, [])

  function handleLogout() {
    sessionStorage.removeItem('dashboard_creds')
    navigate('/login')
  }

  function getAvgScore(scorecard) {
    if (!scorecard?.scores) return null
    const vals = Object.values(scorecard.scores)
    if (!vals.length) return null
    return (vals.reduce((s, v) => s + (v.score || 0), 0) / vals.length).toFixed(1)
  }

  const scored = submissions.filter(s => s.status === 'scored' && s.scorecard?.scores)
  const ranked = [...scored].sort((a, b) => {
    const sa = parseFloat(getAvgScore(a.scorecard) || 0)
    const sb = parseFloat(getAvgScore(b.scorecard) || 0)
    return sb - sa
  })

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <div style={s.eyebrow}>
              <div style={s.eyebrowLine} />
              <span style={s.eyebrowText}>Candidate Rankings</span>
            </div>
            <h1 style={s.title}>NativeEval Dashboard</h1>
            <p style={s.sub}>{loading ? 'Loading…' : `${ranked.length} scored submission${ranked.length !== 1 ? 's' : ''}`}</p>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {!loading && !error && (
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
                      <button style={s.viewBtn} onClick={() => navigate(`/score/${sub.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-section)', padding: '40px 20px' },
  container: { maxWidth: '960px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  title: { fontSize: '26px', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-head)', marginBottom: '4px' },
  sub: { fontSize: '14px', color: 'var(--text-muted)' },
  logoutBtn: { background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text-body)', borderRadius: '3px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  errorBox: { background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '4px', padding: '16px 20px', fontSize: '14px', color: '#dc2626', marginBottom: '20px' },
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
