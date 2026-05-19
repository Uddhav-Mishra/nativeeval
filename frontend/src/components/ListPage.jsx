import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getResults } from '../utils/api'

const AXES = [
  { key: 'planning_design',     color: '#6366f1' },
  { key: 'ai_collaboration',    color: '#8b5cf6' },
  { key: 'agent_orchestration', color: '#06b6d4' },
  { key: 'debugging',           color: '#f59e0b' },
  { key: 'code_quality',        color: '#22c55e' },
  { key: 'communication',       color: '#ef4444' },
]

function avgScore(scorecard) {
  if (!scorecard?.scores) return 0
  const vals = Object.values(scorecard.scores)
  return vals.length ? (vals.reduce((sum, v) => sum + (v.score || 0), 0) / vals.length).toFixed(1) : 0
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function logout(navigate) {
  sessionStorage.removeItem('dashboard_creds')
  navigate('/login')
}

export default function ListPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getResults()
      .then(data => { setResults(data); setLoading(false) })
      .catch(err => { setError(err.message || 'Failed to load results'); setLoading(false) })
  }, [])

  return (
    <div style={s.root}>
      {/* NAV */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <a href="/" style={s.navLogo}>
            Native<span style={s.logoGold}>Eval</span>
          </a>
          <div style={s.navLinks}>
            <a href="/#how-it-works" style={s.navLink}>How it works</a>
            <a href="/#scoring" style={s.navLink}>Scoring</a>
            <a href="/results" style={{ ...s.navLink, color: 'var(--gold)', fontWeight: '600' }}>Results</a>
          </div>
          <button style={s.navCta} onClick={() => navigate('/submit')}>
            Submit Transcript
          </button>
          <button style={s.logoutBtn} onClick={() => logout(navigate)}>Sign out</button>
        </div>
      </nav>

      {/* PAGE BODY */}
      <div style={s.page}>
        <div style={s.container}>
          {/* Header */}
          <div style={s.pageHeader}>
            <div style={s.eyebrow}>
              <div style={s.eyebrowLine} />
              <span style={s.eyebrowText}>Public Scorecards</span>
            </div>
            <h1 style={s.pageH1}>All Scorecards</h1>
            <p style={s.pageSubtitle}>Public results from all scored transcripts</p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={s.center}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Loading scorecards…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={s.errorBox}>{error}</div>
          )}

          {/* Empty state */}
          {!loading && !error && results.length === 0 && (
            <div style={s.emptyState}>
              <p style={s.emptyText}>No scorecards yet. Be the first to submit.</p>
              <button style={s.emptyBtn} onClick={() => navigate('/submit')}>
                Submit Transcript
              </button>
            </div>
          )}

          {/* Results grid */}
          {!loading && !error && results.length > 0 && (
            <div style={s.grid}>
              {results.map(item => {
                const overall = avgScore(item.scorecard)
                const scores = item.scorecard?.scores || {}
                return (
                  <div key={item.id} style={s.card}>
                    {/* Top row */}
                    <div style={s.cardTop}>
                      <div style={s.cardTopLeft}>
                        <span style={s.candidateName}>{item.candidate_name}</span>
                        {item.transcript_type && (
                          <span style={s.typeBadge}>{item.transcript_type.toUpperCase()}</span>
                        )}
                      </div>
                      <span style={s.dateText}>{formatDate(item.created_at)}</span>
                    </div>

                    {/* Score display */}
                    <div style={s.scoreRow}>
                      <span style={s.scoreNum}>{overall}</span>
                      <span style={s.scoreDenom}>/10</span>
                      <span style={s.scoreLabel}>Overall</span>
                    </div>

                    {/* Mini axis row */}
                    <div style={s.axisRow}>
                      {AXES.map(axis => {
                        const sc = scores[axis.key]
                        const val = sc?.score ?? '–'
                        return (
                          <div key={axis.key} style={s.axisMini}>
                            <span style={{ ...s.axisDot, background: axis.color }} />
                            <span style={s.axisMiniScore}>{val}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* View button */}
                    <button
                      style={s.viewBtn}
                      onClick={() => window.open(`/score/${item.id}`, '_blank')}
                    >
                      View Scorecard →
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  root: { fontFamily: "'Inter', sans-serif", background: 'var(--bg-section)', minHeight: '100vh' },

  /* NAV — identical to LandingPage */
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    transition: 'background 0.25s, box-shadow 0.25s',
    background: 'transparent',
  },
  navScrolled: {
    background: '#ffffff',
    boxShadow: '0 2px 20px rgba(10,22,40,0.08)',
  },
  navInner: {
    maxWidth: '1100px', margin: '0 auto', padding: '0 28px',
    height: '64px', display: 'flex', alignItems: 'center', gap: '32px',
  },
  navLogo: {
    fontSize: '18px', fontWeight: '800', letterSpacing: '-0.025em',
    color: 'var(--navy)', textDecoration: 'none', marginRight: 'auto',
  },
  logoGold: { color: 'var(--gold)' },
  navLinks: { display: 'flex', gap: '28px' },
  navLink: {
    fontSize: '13px', fontWeight: '500', color: 'var(--text-body)',
    textDecoration: 'none', letterSpacing: '0.01em',
  },
  navCta: {
    fontSize: '13px', fontWeight: '600', padding: '9px 20px',
    background: 'var(--navy)', color: '#fff', border: 'none',
    borderRadius: '3px', cursor: 'pointer', letterSpacing: '0.01em',
    fontFamily: 'inherit',
  },
  logoutBtn: {
    fontSize: '13px', fontWeight: '600', padding: '9px 16px',
    background: 'transparent', color: 'var(--text-body)',
    border: '1.5px solid var(--border)', borderRadius: '3px',
    cursor: 'pointer', fontFamily: 'inherit',
  },

  /* PAGE BODY */
  page: { background: 'var(--bg-section)', paddingTop: '100px', paddingBottom: '80px', minHeight: '100vh' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '0 28px' },

  pageHeader: { marginBottom: '48px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  pageH1: { fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-head)', marginBottom: '10px' },
  pageSubtitle: { fontSize: '15px', color: 'var(--text-body)', lineHeight: 1.65 },

  /* LOADING / EMPTY */
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: '16px' },
  spinner: { width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { fontSize: '14px', color: 'var(--text-muted)' },
  errorBox: { background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '4px', padding: '16px 20px', fontSize: '14px', color: '#dc2626' },
  emptyState: { textAlign: 'center', padding: '80px 0' },
  emptyText: { fontSize: '16px', color: 'var(--text-body)', marginBottom: '24px' },
  emptyBtn: {
    background: 'var(--navy)', color: '#fff', border: 'none',
    borderRadius: '3px', padding: '12px 24px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
  },

  /* GRID */
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },

  /* CARD */
  card: {
    background: '#fff', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '24px 28px',
    transition: 'box-shadow 0.2s',
    cursor: 'default',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '8px' },
  cardTopLeft: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  candidateName: { fontSize: '16px', fontWeight: '700', color: 'var(--navy)' },
  typeBadge: {
    fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em',
    padding: '3px 9px', border: '1px solid rgba(201,168,76,0.4)',
    borderRadius: '2px', color: 'var(--gold)', background: 'var(--gold-dim)',
  },
  dateText: { fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '2px' },

  /* SCORE */
  scoreRow: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' },
  scoreNum: { fontSize: '32px', fontWeight: '800', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: 1 },
  scoreDenom: { fontSize: '16px', fontWeight: '600', color: 'var(--text-muted)' },
  scoreLabel: { fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginLeft: '6px' },

  /* AXIS MINI ROW */
  axisRow: { display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' },
  axisMini: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  axisDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'block' },
  axisMiniScore: { fontSize: '11px', fontWeight: '600', color: 'var(--text-body)' },

  /* VIEW BUTTON */
  viewBtn: {
    width: '100%', background: 'var(--navy)', color: '#fff',
    border: 'none', borderRadius: '3px', padding: '10px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    fontFamily: 'inherit', letterSpacing: '0.02em',
  },
}
