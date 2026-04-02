import { useEffect } from 'react'
import { useTimer } from '../hooks/useTimer'

export default function Timer({ onStart, onExpire, autoStart = false }) {
  const timer = useTimer(60)

  useEffect(() => {
    if (autoStart) {
      timer.start()
      onStart?.()
    }
  }, [autoStart])

  useEffect(() => {
    if (timer.secondsLeft === 0) {
      onExpire?.()
    }
  }, [timer.secondsLeft])

  const pad = n => String(n).padStart(2, '0')

  const barColor = timer.isDanger ? 'var(--danger)' : timer.isWarning ? 'var(--warning)' : 'var(--accent)'

  return (
    <div style={styles.container}>
      <span style={{ ...styles.time, color: timer.isDanger ? 'var(--danger)' : timer.isWarning ? 'var(--warning)' : 'var(--text-primary)' }}>
        {pad(timer.minutes)}:{pad(timer.seconds)}
      </span>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${timer.percent}%`, background: barColor }} />
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px',
  },
  time: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '48px',
  },
  barTrack: {
    width: '120px',
    height: '4px',
    background: 'var(--bg-elevated)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 1s linear, background 0.3s',
  }
}
