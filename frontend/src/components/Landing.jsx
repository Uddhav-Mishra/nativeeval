import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSession } from '../utils/api'

export default function Landing() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleStart(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please fill in both fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await startSession(name.trim(), email.trim())
      localStorage.setItem('nativeeval_session_id', data.session_id)
      localStorage.setItem('nativeeval_candidate_name', name.trim())
      navigate('/workspace')
    } catch (err) {
      setError('Failed to start session. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>NativeEval</span>
          <span style={styles.logoBadge}>Beta</span>
        </div>
        <h1 style={styles.title}>Engineering Assessment</h1>
        <p style={styles.subtitle}>
          You'll be working on a real codebase with bugs and features to implement.
          You have <strong>60 minutes</strong>. Use the AI assistant, commit your changes,
          and complete as many tickets as you can.
        </p>
        <div style={styles.features}>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🐛</span>
            <span>3 bugs to fix</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>✨</span>
            <span>2 features to build</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>🤖</span>
            <span>AI assistant available</span>
          </div>
          <div style={styles.feature}>
            <span style={styles.featureIcon}>⏱️</span>
            <span>60 minute timer</span>
          </div>
        </div>
        <form style={styles.form} onSubmit={handleStart}>
          <input
            style={styles.input}
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Starting...' : 'Start Assessment →'}
          </button>
        </form>
        <p style={styles.disclaimer}>
          Your session will be recorded for evaluation purposes.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--bg-primary)',
    padding: '20px',
  },
  card: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '48px',
    maxWidth: '480px',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '-0.5px',
  },
  logoBadge: {
    fontSize: '10px',
    fontWeight: '600',
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    padding: '2px 8px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '24px',
    fontSize: '14px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '32px',
  },
  feature: {
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  featureIcon: {
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  error: {
    color: 'var(--danger)',
    fontSize: '13px',
  },
  button: {
    background: 'var(--accent)',
    color: '#fff',
    padding: '13px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '4px',
  },
  disclaimer: {
    marginTop: '20px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    textAlign: 'center',
  }
}
