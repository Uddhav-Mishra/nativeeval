import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSubmission } from '../utils/api'
import RadarChart from './RadarChart'
import { SCORING_AXES } from '../data/scoringAxes'

export default function ScorecardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getSubmission(id)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load scorecard'); setLoading(false) })
  }, [id])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Scoring transcript…</p>
    </div>
  )

  if (error || !data) return (
    <div style={s.center}>
      <p style={{ color: 'var(--text-body)', marginBottom: '16px' }}>{error || 'Scorecard not found.'}</p>
      <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>
    </div>
  )

  if (data.status === 'error') return (
    <div style={s.center}>
      <p style={{ color: '#dc2626', marginBottom: '16px' }}>Scoring failed. Please try again.</p>
      <button style={s.backBtn} onClick={() => navigate('/')}>← Back</button>
    </div>
  )

  const scorecard = data.scorecard || {}
  const scores = scorecard.scores || {}
  const avgScore = Object.keys(scores).length > 0
    ? Object.values(scores).reduce((sum, s) => sum + (s.score || 0), 0) / Object.keys(scores).length
    : 0

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.backLink} onClick={() => navigate('/')}>← Back</button>

        <div style={s.header}>
          <div>
            <div style={s.eyebrow}>
              <div style={s.eyebrowLine} />
              <span style={s.eyebrowText}>Assessment Results</span>
            </div>
            <h1 style={s.title}>{data.candidate_name}</h1>
            <div style={s.badges}>
              {data.transcript_type && (
                <span style={s.badge}>{data.transcript_type.toUpperCase()}</span>
              )}
            </div>
          </div>
          <div style={s.scoreWidget}>
            <span style={s.scoreNum}>{avgScore.toFixed(1)}</span>
            <span style={s.scoreLabel}>Overall</span>
          </div>
        </div>

        <div style={s.radarCard}>
          <RadarChart scores={scores} axes={SCORING_AXES} />
        </div>

        <div style={s.axesGrid}>
          {SCORING_AXES.map(axis => {
            const sc = scores[axis.key]
            if (!sc) return null
            return (
              <div key={axis.key} style={s.axisCard}>
                <div style={s.axisHeader}>
                  <span style={{ ...s.axisDot, background: axis.color }} />
                  <span style={s.axisLabel}>{axis.label}</span>
                  <span style={{ ...s.axisScore, color: axis.color }}>{sc.score}/10</span>
                </div>
                <p style={s.axisFeedback}>{sc.feedback}</p>
              </div>
            )
          })}
        </div>

        {scorecard.overall_summary && (
          <div style={s.section}>
            <div style={s.sectionTag}>Summary</div>
            <p style={s.sectionText}>{scorecard.overall_summary}</p>
          </div>
        )}

        <div style={s.listsRow}>
          {scorecard.strengths?.length > 0 && (
            <div style={s.listCard}>
              <div style={{ ...s.sectionTag, color: '#1D8A4F' }}>Strengths</div>
              <ul style={s.list}>
                {scorecard.strengths.map((str, i) => (
                  <li key={i} style={s.listItem}><span style={{ color: '#1D8A4F', fontWeight: '700', flexShrink: 0 }}>+</span> {str}</li>
                ))}
              </ul>
            </div>
          )}
          {scorecard.areas_for_improvement?.length > 0 && (
            <div style={s.listCard}>
              <div style={{ ...s.sectionTag, color: '#C87C0A' }}>Areas to Improve</div>
              <ul style={s.list}>
                {scorecard.areas_for_improvement.map((str, i) => (
                  <li key={i} style={s.listItem}><span style={{ color: '#C87C0A', fontWeight: '700', flexShrink: 0 }}>△</span> {str}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button style={s.shareBtn} onClick={handleShare}>
          {copied ? '✓ Link copied!' : '🔗 Share scorecard'}
        </button>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-section)', padding: '40px 20px' },
  container: { maxWidth: '820px', margin: '0 auto' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' },
  spinner: { width: '32px', height: '32px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  backLink: { background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', padding: '0', marginBottom: '28px', fontFamily: 'inherit', fontWeight: '500' },
  backBtn: { background: 'var(--navy)', color: 'var(--white)', border: 'none', borderRadius: '3px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  title: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.025em', color: 'var(--text-head)', marginBottom: '10px' },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badge: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', padding: '3px 10px', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '2px', color: 'var(--gold)', background: 'var(--gold-dim)' },
  scoreWidget: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 24px', boxShadow: '0 2px 12px rgba(10,22,40,0.06)' },
  scoreNum: { fontSize: '40px', fontWeight: '800', color: 'var(--navy)', letterSpacing: '-0.03em', lineHeight: 1 },
  scoreLabel: { fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '4px' },
  radarCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '28px', display: 'flex', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 2px 12px rgba(10,22,40,0.05)' },
  axesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  axisCard: { background: 'var(--white)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)', borderRadius: '4px', padding: '14px 16px', boxShadow: '0 1px 6px rgba(10,22,40,0.04)' },
  axisHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  axisDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  axisLabel: { fontSize: '13px', fontWeight: '600', flex: 1, color: 'var(--text-head)' },
  axisScore: { fontSize: '15px', fontWeight: '700' },
  axisFeedback: { fontSize: '12px', color: 'var(--text-body)', lineHeight: '1.55' },
  section: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' },
  sectionTag: { fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' },
  sectionText: { fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.65' },
  listsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
  listCard: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '18px 20px' },
  list: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: { fontSize: '13px', color: 'var(--text-body)', display: 'flex', gap: '8px', lineHeight: '1.5' },
  shareBtn: { width: '100%', background: 'var(--white)', border: '1.5px solid var(--border)', color: 'var(--text-body)', padding: '13px', borderRadius: '3px', fontSize: '14px', cursor: 'pointer', fontWeight: '500', fontFamily: 'inherit', transition: 'border-color 0.2s' },
}
