import { useState } from 'react'

export default function CommitBar({ tickets, completedTickets, onCommit, files, previousFiles }) {
  const [message, setMessage] = useState('')
  const [selectedTickets, setSelectedTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  function toggleTicket(id) {
    setSelectedTickets(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  async function handleCommit() {
    if (!message.trim()) return
    setLoading(true)

    // Build diffs
    const diffs = {}
    for (const [filename, content] of Object.entries(files)) {
      const before = previousFiles[filename] || ''
      if (before !== content) {
        diffs[filename] = { before, after: content }
      }
    }

    await onCommit(message, selectedTickets, diffs)
    setMessage('')
    setSelectedTickets([])
    setExpanded(false)
    setLoading(false)
  }

  const incompleteTickets = tickets.filter(t => !completedTickets.includes(t.id))

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.inputWrapper}>
          <span style={styles.gitIcon}>⌥</span>
          <input
            style={styles.input}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Commit message..."
            onKeyDown={e => e.key === 'Enter' && handleCommit()}
          />
        </div>
        {incompleteTickets.length > 0 && (
          <button
            style={styles.ticketToggle}
            onClick={() => setExpanded(e => !e)}
          >
            {selectedTickets.length > 0 ? `${selectedTickets.length} linked` : 'Link tickets'}
          </button>
        )}
        <button
          style={{ ...styles.commitBtn, opacity: message.trim() ? 1 : 0.5 }}
          onClick={handleCommit}
          disabled={loading || !message.trim()}
        >
          {loading ? '...' : 'Commit'}
        </button>
      </div>
      {expanded && (
        <div style={styles.ticketPicker}>
          {incompleteTickets.map(t => (
            <button
              key={t.id}
              style={{
                ...styles.ticketBtn,
                ...(selectedTickets.includes(t.id) ? styles.ticketBtnSelected : {})
              }}
              onClick={() => toggleTicket(t.id)}
            >
              <span style={styles.ticketBtnId}>{t.id}</span>
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border)',
    padding: '10px 12px',
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '0 10px',
    gap: '8px',
  },
  gitIcon: {
    color: 'var(--text-muted)',
    fontSize: '13px',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontSize: '13px',
    padding: '7px 0',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  },
  ticketToggle: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  commitBtn: {
    background: 'var(--accent)',
    color: '#fff',
    padding: '7px 16px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  ticketPicker: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  ticketBtn: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  ticketBtnSelected: {
    background: 'var(--accent-light)',
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  ticketBtnId: {
    fontFamily: 'var(--font-mono)',
    opacity: 0.7,
  }
}
