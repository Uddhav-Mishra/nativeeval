const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function analyzeTranscript(formData) {
  const res = await fetch(`${BASE}/api/analyze`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getSubmission(id) {
  const res = await fetch(`${BASE}/api/submissions/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getSubmissions(username, password) {
  const creds = btoa(`${username}:${password}`)
  const res = await fetch(`${BASE}/api/submissions`, {
    headers: { 'Authorization': `Basic ${creds}` }
  })
  if (res.status === 401) throw new Error('401')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
