import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketPanel from './TicketPanel'
import CodeEditor from './CodeEditor'
import LivePreview from './LivePreview'
import AIChat from './AIChat'
import CommitBar from './CommitBar'
import Timer from './Timer'
import { getTickets, getInitialCode, postCommit, completeTicket, submitSession } from '../utils/api'

export default function Workspace() {
  const navigate = useNavigate()
  const sessionId = localStorage.getItem('nativeeval_session_id')

  const [tickets, setTickets] = useState([])
  const [completedTickets, setCompletedTickets] = useState([])
  const [files, setFiles] = useState({})
  const [previousFiles, setPreviousFiles] = useState({})
  const [activeFile, setActiveFile] = useState('App.jsx')
  const [loading, setLoading] = useState(true)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rightPanel, setRightPanel] = useState('preview') // 'preview' | 'chat'

  useEffect(() => {
    if (!sessionId) {
      navigate('/')
      return
    }
    Promise.all([getTickets(), getInitialCode()]).then(([t, f]) => {
      setTickets(t)
      setFiles(f)
      setPreviousFiles(f)
      setLoading(false)
    })
  }, [])

  function handleFileChange(filename, content) {
    setFiles(prev => ({ ...prev, [filename]: content }))
  }

  async function handleCommit(message, linkedTickets, diffs) {
    if (!sessionId) return
    await postCommit(sessionId, message, linkedTickets, diffs)
    setPreviousFiles({ ...files })
  }

  async function handleTicketComplete(ticketId) {
    if (!sessionId) return
    await completeTicket(ticketId, sessionId)
    setCompletedTickets(prev => [...prev, ticketId])
  }

  async function handleSubmit() {
    setSubmitting(true)
    const result = await submitSession(sessionId)
    navigate(`/scorecard/${sessionId}`)
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p>Loading workspace...</p>
      </div>
    )
  }

  return (
    <div style={styles.root}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <span style={styles.logo}>NativeEval</span>
          <span style={styles.separator}>|</span>
          <span style={styles.projectName}>TaskFlow Assessment</span>
        </div>
        <div style={styles.topbarCenter}>
          <Timer autoStart={true} onExpire={() => setShowSubmitConfirm(true)} />
        </div>
        <div style={styles.topbarRight}>
          <div style={styles.panelToggle}>
            <button
              style={{ ...styles.toggleBtn, ...(rightPanel === 'preview' ? styles.toggleBtnActive : {}) }}
              onClick={() => setRightPanel('preview')}
            >
              Preview
            </button>
            <button
              style={{ ...styles.toggleBtn, ...(rightPanel === 'chat' ? styles.toggleBtnActive : {}) }}
              onClick={() => setRightPanel('chat')}
            >
              AI Chat
            </button>
          </div>
          <button style={styles.submitBtn} onClick={() => setShowSubmitConfirm(true)}>
            Submit →
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={styles.main}>
        {/* Left: Tickets */}
        <div style={styles.ticketPane}>
          <TicketPanel
            tickets={tickets}
            completedTickets={completedTickets}
            onComplete={handleTicketComplete}
            sessionId={sessionId}
          />
        </div>

        {/* Center: Editor + Commit bar */}
        <div style={styles.editorPane}>
          <CodeEditor
            files={files}
            activeFile={activeFile}
            onFileChange={handleFileChange}
            onFileSelect={setActiveFile}
          />
          <CommitBar
            tickets={tickets}
            completedTickets={completedTickets}
            onCommit={handleCommit}
            files={files}
            previousFiles={previousFiles}
          />
        </div>

        {/* Right: Preview or Chat */}
        <div style={styles.rightPane}>
          {rightPanel === 'preview' ? (
            <LivePreview files={files} />
          ) : (
            <AIChat sessionId={sessionId} currentFiles={files} />
          )}
        </div>
      </div>

      {/* Submit confirm dialog */}
      {showSubmitConfirm && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h2 style={styles.dialogTitle}>Submit Assessment?</h2>
            <p style={styles.dialogText}>
              You've completed {completedTickets.length} of {tickets.length} tickets.
              Once submitted, you'll see your scorecard.
            </p>
            <div style={styles.dialogButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Scoring...' : 'Submit & See Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '48px',
    padding: '0 16px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  logo: {
    fontWeight: '700',
    color: 'var(--accent)',
    fontSize: '14px',
  },
  separator: {
    color: 'var(--border)',
  },
  projectName: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  topbarCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  topbarRight: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  panelToggle: {
    display: 'flex',
    background: 'var(--bg-tertiary)',
    borderRadius: '6px',
    padding: '2px',
    gap: '2px',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  toggleBtnActive: {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
  },
  submitBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  ticketPane: {
    width: '260px',
    flexShrink: 0,
    overflow: 'hidden',
  },
  editorPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  rightPane: {
    width: '340px',
    flexShrink: 0,
    overflow: 'hidden',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  dialog: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '400px',
    width: '100%',
  },
  dialogTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  dialogText: {
    color: 'var(--text-secondary)',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  dialogButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    padding: '9px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  confirmBtn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
}
