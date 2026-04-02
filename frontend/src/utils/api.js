const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function startSession(candidateName, candidateEmail) {
  const res = await fetch(`${BASE_URL}/api/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidate_name: candidateName, candidate_email: candidateEmail })
  })
  return res.json()
}

export async function getSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/session/${sessionId}`)
  return res.json()
}

export async function postCommit(sessionId, message, linkedTickets, files) {
  const res = await fetch(`${BASE_URL}/api/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, linked_tickets: linkedTickets, files })
  })
  return res.json()
}

export async function completeTicket(ticketId, sessionId) {
  const res = await fetch(`${BASE_URL}/api/ticket/${ticketId}/complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  })
  return res.json()
}

export async function submitSession(sessionId) {
  const res = await fetch(`${BASE_URL}/api/session/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  })
  return res.json()
}

export async function getScorecard(sessionId) {
  const res = await fetch(`${BASE_URL}/api/scorecard/${sessionId}`)
  return res.json()
}

export async function getTickets() {
  const res = await fetch(`${BASE_URL}/api/tickets`)
  return res.json()
}

export async function getInitialCode() {
  const res = await fetch(`${BASE_URL}/api/initial-code`)
  return res.json()
}

export function streamChat(sessionId, message, currentFiles, onChunk, onDone) {
  const controller = new AbortController()

  fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message, current_files: currentFiles }),
    signal: controller.signal
  }).then(async res => {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) onChunk(data.text)
            if (data.done) onDone()
          } catch {}
        }
      }
    }
  }).catch(err => {
    if (err.name !== 'AbortError') console.error('Stream error:', err)
  })

  return () => controller.abort()
}
