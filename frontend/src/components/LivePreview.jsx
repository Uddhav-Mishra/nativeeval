import { useEffect, useRef } from 'react'
import { getPreviewHTML } from '../engine/previewEngine'

export default function LivePreview({ files }) {
  const iframeRef = useRef(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Set initial HTML
    const blob = new Blob([getPreviewHTML()], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    iframe.src = url

    return () => URL.revokeObjectURL(url)
  }, [])

  useEffect(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const iframe = iframeRef.current
      if (!iframe || !iframe.contentWindow) return
      iframe.contentWindow.postMessage({ type: 'UPDATE_FILES', files }, '*')
    }, 500)

    return () => clearTimeout(timeoutRef.current)
  }, [files])

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>Live Preview</span>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, background: '#ef4444' }} />
          <span style={{ ...styles.dot, background: '#f59e0b' }} />
          <span style={{ ...styles.dot, background: '#22c55e' }} />
        </div>
      </div>
      <iframe
        ref={iframeRef}
        style={styles.iframe}
        sandbox="allow-scripts"
        title="Live Preview"
      />
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg-secondary)',
    borderLeft: '1px solid var(--border)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  title: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  dots: {
    display: 'flex',
    gap: '5px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  iframe: {
    flex: 1,
    border: 'none',
    background: '#fff',
  }
}
