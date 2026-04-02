import { useState, useRef, useEffect } from 'react'
import { streamChat } from '../utils/api'

export default function AIChat({ sessionId, currentFiles }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI coding assistant. I can help you debug issues, understand the codebase, or write code. What would you like to work on?" }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(e) {
    e?.preventDefault()
    if (!input.trim() || streaming) return

    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setStreaming(true)

    let assistantContent = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    cancelRef.current = streamChat(
      sessionId,
      userMsg,
      currentFiles,
      (chunk) => {
        assistantContent += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent, streaming: true }
          return updated
        })
      },
      () => {
        setStreaming(false)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
          return updated
        })
      }
    )
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>AI Assistant</span>
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Claude
        </div>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.message, ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage) }}>
            <div style={styles.messageRole}>{msg.role === 'user' ? 'You' : 'Claude'}</div>
            <div style={styles.messageContent}>
              {formatMessage(msg.content)}
              {msg.streaming && <span style={styles.cursor}>▋</span>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form style={styles.inputArea} onSubmit={handleSend}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about the code, bugs, or request help..."
          rows={3}
          disabled={streaming}
        />
        <button style={styles.sendBtn} type="submit" disabled={streaming || !input.trim()}>
          {streaming ? '...' : '↑'}
        </button>
      </form>
    </div>
  )
}

function formatMessage(content) {
  if (!content) return null
  // Simple code block rendering
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const lines = part.split('\n')
      const lang = lines[0].slice(3)
      const code = lines.slice(1, -1).join('\n')
      return (
        <pre key={i} style={styles.codeBlock}>
          <code>{code}</code>
        </pre>
      )
    }
    return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
  })
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
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  title: {
    fontSize: '13px',
    fontWeight: '600',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    background: 'var(--bg-tertiary)',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--success)',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageRole: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  messageContent: {
    maxWidth: '90%',
    fontSize: '13px',
    lineHeight: '1.5',
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
  },
  cursor: {
    animation: 'blink 1s step-end infinite',
    color: 'var(--accent)',
  },
  codeBlock: {
    background: '#0d0d0d',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    overflowX: 'auto',
    margin: '8px 0',
    color: '#d4d4d4',
    whiteSpace: 'pre',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderTop: '1px solid var(--border)',
    flexShrink: 0,
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    lineHeight: '1.5',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  },
  sendBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}
