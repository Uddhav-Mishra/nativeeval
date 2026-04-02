import { useState } from 'react'

const PRIORITY_COLORS = {
  High: 'var(--danger)',
  Medium: 'var(--warning)',
  Low: 'var(--success)',
}

const TYPE_COLORS = {
  Bug: '#ef4444',
  Feature: '#6366f1',
}

export default function TicketPanel({ tickets, completedTickets, onComplete, sessionId }) {
  const [selected, setSelected] = useState(null)

  const ticket = selected ? tickets.find(t => t.id === selected) : null

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Tickets</span>
        <span style={styles.headerCount}>{completedTickets.length}/{tickets.length} done</span>
      </div>

      {ticket ? (
        <div style={styles.detail}>
          <button style={styles.backBtn} onClick={() => setSelected(null)}>← Back</button>
          <div style={styles.detailHeader}>
            <span style={{ ...styles.typeBadge, background: `${TYPE_COLORS[ticket.type]}22`, color: TYPE_COLORS[ticket.type] }}>
              {ticket.type}
            </span>
            <span style={{ ...styles.priorityDot, background: PRIORITY_COLORS[ticket.priority] }} />
            <span style={styles.ticketId}>{ticket.id}</span>
          </div>
          <h3 style={styles.detailTitle}>{ticket.title}</h3>
          <p style={styles.detailDesc}>{ticket.description}</p>
          {ticket.acceptance_criteria && (
            <div style={styles.criteria}>
              <p style={styles.criteriaLabel}>Acceptance Criteria</p>
              <ul style={styles.criteriaList}>
                {ticket.acceptance_criteria.map((c, i) => (
                  <li key={i} style={styles.criteriaItem}>
                    <span style={styles.checkIcon}>☐</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ticket.file && (
            <div style={styles.fileHint}>
              <span style={styles.fileLabel}>File: </span>
              <code style={styles.fileCode}>{ticket.file}</code>
            </div>
          )}
          {!completedTickets.includes(ticket.id) ? (
            <button
              style={styles.completeBtn}
              onClick={() => onComplete(ticket.id)}
            >
              Mark as Done ✓
            </button>
          ) : (
            <div style={styles.completedBadge}>✓ Completed</div>
          )}
        </div>
      ) : (
        <div style={styles.list}>
          {tickets.map(t => (
            <div
              key={t.id}
              style={{
                ...styles.ticketItem,
                opacity: completedTickets.includes(t.id) ? 0.5 : 1,
                borderLeft: `3px solid ${TYPE_COLORS[t.type] || 'var(--border)'}`,
              }}
              onClick={() => setSelected(t.id)}
            >
              <div style={styles.ticketTop}>
                <span style={styles.ticketId}>{t.id}</span>
                <span style={{ ...styles.priorityBadge, color: PRIORITY_COLORS[t.priority] }}>
                  {t.priority}
                </span>
                {completedTickets.includes(t.id) && <span style={styles.doneCheck}>✓</span>}
              </div>
              <div style={styles.ticketTitle}>{t.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-secondary)',
  },
  headerCount: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    background: 'var(--bg-tertiary)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  list: {
    overflowY: 'auto',
    flex: 1,
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  ticketItem: {
    padding: '12px 14px',
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.1s',
    paddingLeft: '11px',
  },
  ticketTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  ticketId: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  },
  priorityBadge: {
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  doneCheck: {
    color: 'var(--success)',
    fontSize: '12px',
  },
  ticketTitle: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
  },
  detail: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '13px',
    cursor: 'pointer',
    marginBottom: '16px',
    padding: '0',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  typeBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  priorityDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    lineHeight: '1.4',
  },
  detailDesc: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  criteria: {
    background: 'var(--bg-tertiary)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
  },
  criteriaLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    fontWeight: '600',
  },
  criteriaList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  criteriaItem: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  checkIcon: {
    color: 'var(--text-muted)',
    flexShrink: 0,
  },
  fileHint: {
    marginBottom: '16px',
    fontSize: '13px',
  },
  fileLabel: {
    color: 'var(--text-muted)',
  },
  fileCode: {
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
    background: 'var(--accent-light)',
    padding: '1px 6px',
    borderRadius: '4px',
  },
  completeBtn: {
    width: '100%',
    background: 'var(--success)',
    color: '#fff',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    border: 'none',
    cursor: 'pointer',
  },
  completedBadge: {
    width: '100%',
    background: 'var(--bg-elevated)',
    color: 'var(--success)',
    padding: '10px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid var(--success)',
  }
}
