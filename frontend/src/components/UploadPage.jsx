import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeTranscript } from '../utils/api'

export default function UploadPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inputMode, setInputMode] = useState('file')
  const [file, setFile] = useState(null)
  const [pasteText, setPasteText] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Candidate name is required'); return }
    if (inputMode === 'file' && !file) { setError('Please select a file'); return }
    if (inputMode === 'paste' && !pasteText.trim()) { setError('Please paste your transcript'); return }

    const fd = new FormData()
    fd.append('candidate_name', name.trim())
    if (email.trim()) fd.append('email', email.trim())
    if (inputMode === 'file') fd.append('file', file)
    else fd.append('text', pasteText)

    setLoading(true)
    try {
      const res = await analyzeTranscript(fd)
      navigate(`/score/${res.submission_id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.eyebrow}>
          <div style={s.eyebrowLine} />
          <span style={s.eyebrowText}>AI-Native Hiring</span>
        </div>
        <h1 style={s.title}>NativeEval</h1>
        <p style={s.subtitle}>Upload a Claude Code, Cursor, or Windsurf session transcript to get an AI-native engineering scorecard.</p>

        <form onSubmit={handleSubmit}>
          <div style={s.fieldGroup}>
            <label style={s.label}>Candidate Name *</label>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" autoComplete="off" />
          </div>

          <div style={{ ...s.fieldGroup, marginBottom: '24px' }}>
            <label style={s.label}>Email (optional)</label>
            <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" autoComplete="off" />
          </div>

          <div style={s.modeToggle}>
            <button type="button" style={inputMode === 'file' ? s.modeActive : s.modeInactive} onClick={() => setInputMode('file')}>Upload File</button>
            <button type="button" style={inputMode === 'paste' ? s.modeActive : s.modeInactive} onClick={() => setInputMode('paste')}>Paste Text</button>
          </div>

          {inputMode === 'file' ? (
            <div
              style={{ ...s.dropZone, ...(dragging ? s.dropZoneActive : {}) }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".jsonl,.md,.txt" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div>
                  <div style={s.fileName}>{file.name}</div>
                  <div style={s.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              ) : (
                <div>
                  <div style={s.dropIcon}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 4v12M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                  <div style={s.dropText}>Drop your .jsonl or .md file here</div>
                  <div style={s.dropHint}>or click to browse</div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              style={s.textarea}
              rows={12}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste your session transcript here..."
            />
          )}

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" style={{ ...s.submitBtn, ...(loading ? s.submitDisabled : {}) }} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                <span style={s.spinner} />
                Analysing transcript…
              </span>
            ) : 'Analyse Transcript →'}
          </button>
        </form>

        <p style={s.note}>Transcript is scored by GPT-4o across 6 axes of AI-native engineering</p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
  card: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 32px rgba(10,22,40,0.08)', padding: '48px 44px', width: '100%', maxWidth: '560px' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  title: { fontSize: '30px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-head)', marginBottom: '10px' },
  subtitle: { fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.65', marginBottom: '32px' },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' },
  input: { width: '100%', border: '1px solid var(--border)', borderRadius: '3px', padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit', color: 'var(--text-head)', background: 'var(--white)', outline: 'none', transition: 'border-color 0.2s' },
  modeToggle: { display: 'flex', gap: '8px', marginBottom: '14px' },
  modeActive: { fontSize: '13px', fontWeight: '600', padding: '8px 18px', borderRadius: '3px', cursor: 'pointer', background: 'var(--navy)', color: 'var(--white)', border: '1.5px solid var(--navy)' },
  modeInactive: { fontSize: '13px', fontWeight: '600', padding: '8px 18px', borderRadius: '3px', cursor: 'pointer', background: 'transparent', color: 'var(--text-body)', border: '1.5px solid var(--border)' },
  dropZone: { border: '2px dashed var(--border)', borderRadius: '6px', padding: '36px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', marginBottom: '16px', userSelect: 'none' },
  dropZoneActive: { borderColor: 'var(--gold)', background: 'var(--gold-dim)' },
  dropIcon: { color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', justifyContent: 'center' },
  dropText: { fontSize: '14px', fontWeight: '500', color: 'var(--text-body)', marginBottom: '4px' },
  dropHint: { fontSize: '12px', color: 'var(--text-muted)' },
  fileName: { fontSize: '14px', fontWeight: '600', color: 'var(--navy)', marginBottom: '4px' },
  fileSize: { fontSize: '12px', color: 'var(--text-muted)' },
  textarea: { width: '100%', border: '1px solid var(--border)', borderRadius: '3px', padding: '12px 14px', fontSize: '13px', fontFamily: 'inherit', color: 'var(--text-head)', background: 'var(--white)', outline: 'none', resize: 'vertical', lineHeight: '1.5', marginBottom: '16px' },
  error: { fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '3px', padding: '10px 14px', marginBottom: '16px' },
  submitBtn: { width: '100%', background: 'var(--navy)', color: 'var(--white)', border: 'none', borderRadius: '3px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.01em', transition: 'background 0.2s, transform 0.15s', marginTop: '8px' },
  submitDisabled: { background: 'var(--text-muted)', cursor: 'not-allowed' },
  spinner: { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
  note: { fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px', lineHeight: '1.5' },
}
