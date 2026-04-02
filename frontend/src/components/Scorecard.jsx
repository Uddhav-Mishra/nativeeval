import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getScorecard } from '../utils/api'
import RadarChart from './RadarChart'
import { SCORING_AXES } from '../data/scoringAxes'

export default function Scorecard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getScorecard(id).then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading scorecard...</p>
      </div>
    )
  }

  if (!data || !data.scorecard) {
    return (
      <div style={styles.loading}>
        <p style={{ color: 'var(--text-secondary)' }}>Scorecard not found.</p>
        <button style={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    )
  }

  const { scorecard, candidate_name, duration_minutes } = data
  const scores = scorecard.scores || {}
  const avgScore = Object.values(scores).reduce((sum, s) => sum + (s.score || 0), 0) / Object.keys(scores).length

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.logoText}>NativeEval</div>
            <h1 style={styles.title}>Assessment Results</h1>
            {candidate_name && <p style={styles.name}>{candidate_name}</p>}
            {duration_minutes > 0 && (
              <p style={styles.duration}>{duration_minutes} minutes</p>
            )}
          </div>
          <div style={styles.overallScore}>
            <span style={styles.scoreNumber}>{avgScore.toFixed(1)}</span>
            <span style={styles.scoreLabel}>Overall</span>
          </div>
        </div>

        <div style={styles.radarSection}>
          <RadarChart scores={scores} axes={SCORING_AXES} />
        </div>

        <div style={styles.axesGrid}>
          {SCORING_AXES.map(axis => {
            const s = scores[axis.key]
            if (!s) return null
            return (
              <div key={axis.key} style={styles.axisCard}>
                <div style={styles.axisHeader}>
                  <span style={{ ...styles.axisDot, background: axis.color }} />
                  <span style={styles.axisLabel}>{axis.label}</span>
                  <span style={{ ...styles.axisScore, color: axis.color }}>{s.score}/10</span>
                </div>
                <p style={styles.axisFeedback}>{s.feedback}</p>
              </div>
            )
          })}
        </div>

        {scorecard.overall_summary && (
          <div style={styles.summary}>
            <h3 style={styles.sectionTitle}>Summary</h3>
            <p style={styles.summaryText}>{scorecard.overall_summary}</p>
          </div>
        )}

        <div style={styles.listsRow}>
          {scorecard.strengths?.length > 0 && (
            <div style={styles.listCard}>
              <h3 style={{ ...styles.sectionTitle, color: 'var(--success)' }}>Strengths</h3>
              <ul style={styles.list}>
                {scorecard.strengths.map((s, i) => (
                  <li key={i} style={styles.listItem}>
                    <span style={styles.listDot}>+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {scorecard.areas_for_improvement?.length > 0 && (
            <div style={styles.listCard}>
              <h3 style={{ ...styles.sectionTitle, color: 'var(--warning)' }}>Areas for Improvement</h3>
              <ul style={styles.list}>
                {scorecard.areas_for_improvement.map((s, i) => (
                  <li key={i} style={styles.listItem}>
                    <span style={styles.listDot}>△</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button style={styles.shareBtn} onClick={handleShare}>
          {copied ? '✓ Link Copied!' : '🔗 Share Results'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    padding: '40px 20px',
    overflowY: 'auto',
  },
  container: {
    maxWidth: '760px',
    margin: '0 auto',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    color: 'var(--text-secondary)',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  backBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  logoText: {
    color: 'var(--accent)',
    fontWeight: '700',
    fontSize: '14px',
    marginBottom: '6px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.5px',
  },
  name: {
    color: 'var(--text-secondary)',
    fontSize: '15px',
  },
  duration: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    marginTop: '2px',
  },
  overallScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'var(--accent-light)',
    border: '1px solid var(--accent)',
    borderRadius: '12px',
    padding: '16px 24px',
  },
  scoreNumber: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'var(--accent)',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  radarSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
    background: 'var(--bg-secondary)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid var(--border)',
  },
  axesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  axisCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  axisHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  axisDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  axisLabel: {
    fontSize: '13px',
    fontWeight: '600',
    flex: 1,
  },
  axisScore: {
    fontSize: '15px',
    fontWeight: '700',
  },
  axisFeedback: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  summary: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px 20px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-secondary)',
  },
  summaryText: {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  listsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  listCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '16px 20px',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  listItem: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '8px',
  },
  listDot: {
    color: 'var(--text-muted)',
    flexShrink: 0,
    fontWeight: '700',
  },
  shareBtn: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    padding: '13px',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  }
}
