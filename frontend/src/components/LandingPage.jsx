import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={s.root}>
      {/* NAV */}
      <nav style={{ ...s.nav, ...(scrolled ? s.navScrolled : {}) }}>
        <div style={s.navInner}>
          <a href="/" style={s.navLogo}>
            Native<span style={s.logoGold}>Eval</span>
          </a>
          <div style={s.navLinks}>
            <a href="#how-it-works" style={s.navLink}>How it works</a>
            <a href="#scoring" style={s.navLink}>Scoring</a>
            <a href="/results" style={s.navLink}>Results</a>
          </div>
          <button style={s.navCta} onClick={() => navigate('/submit')}>
            Submit Transcript
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.eyebrow}>
            <div style={s.eyebrowLine} />
            <span style={s.eyebrowText}>AI-Native Engineering</span>
          </div>
          <h1 style={s.heroH1}>
            Score engineers on how they actually use AI
          </h1>
          <p style={s.heroSubtitle}>
            Upload a Claude Code, Cursor, or Windsurf session transcript. Get a scored report on 6 axes of AI-native engineering in under 30 seconds.
          </p>
          <div style={s.heroBtns}>
            <button style={s.btnPrimary} onClick={() => navigate('/submit')}>
              Submit a Transcript →
            </button>
            <button style={s.btnSecondary} onClick={() => navigate('/results')}>
              View Scorecards
            </button>
          </div>
          <div style={s.metricChips}>
            <div style={s.chip}>6 Scoring Axes</div>
            <div style={s.chipDivider} />
            <div style={s.chip}>GPT-4o Mini</div>
            <div style={s.chipDivider} />
            <div style={s.chip}>30 Second Results</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={s.hiwSection}>
        <div style={s.sectionContainer}>
          <div style={s.sectionEyebrow}>
            <div style={s.eyebrowLine} />
            <span style={s.eyebrowText}>Process</span>
          </div>
          <h2 style={s.sectionH2}>Upload. Score. Hire.</h2>
          <div style={s.stepsRow}>
            {[
              {
                num: '01',
                title: 'Upload Transcript',
                desc: 'Paste or upload a .jsonl or .md session file from Claude Code, Cursor, or Windsurf',
              },
              {
                num: '02',
                title: 'AI Scores in 6 Axes',
                desc: 'GPT-4o Mini evaluates Planning, AI Collaboration, Agent Orchestration, Debugging, Code Quality, Communication',
              },
              {
                num: '03',
                title: 'Share the Scorecard',
                desc: 'Get a shareable link. Compare candidates on the ranked dashboard.',
              },
            ].map(step => (
              <div key={step.num} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCORING AXES */}
      <section id="scoring" style={s.scoringSection}>
        <div style={s.sectionContainer}>
          <div style={s.sectionEyebrow}>
            <div style={s.eyebrowLine} />
            <span style={s.eyebrowText}>What We Measure</span>
          </div>
          <h2 style={s.sectionH2}>6 axes of AI-native engineering</h2>
          <div style={s.axesGrid}>
            {SCORING_AXES.map(axis => (
              <div key={axis.key} style={s.axisCard}>
                <div style={s.axisCardHeader}>
                  <span style={{ ...s.axisDot, background: axis.color }} />
                  <span style={s.axisCardLabel}>{axis.label}</span>
                </div>
                <p style={s.axisCardDesc}>{axis.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          <div style={s.ctaEyebrow}>
            <div style={s.eyebrowLineDark} />
            <span style={s.eyebrowTextDark}>Get Started</span>
          </div>
          <h2 style={s.ctaH2}>Ready to evaluate AI-native engineers?</h2>
          <p style={s.ctaSubtitle}>
            Submit a transcript and get your first scorecard in under 30 seconds.
          </p>
          <button style={s.ctaBtn} onClick={() => navigate('/submit')}>
            Submit a Transcript →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div>
            <div style={s.footerLogo}>
              Native<span style={s.logoGold}>Eval</span>
            </div>
            <div style={s.footerTagline}>AI-Native Engineering Assessment</div>
          </div>
          <div style={s.footerCopy}>© NativeEval 2025</div>
        </div>
      </footer>
    </div>
  )
}

const SCORING_AXES = [
  { key: 'planning_design',     label: 'Planning & Design',    color: '#6366f1', desc: 'Structured thinking and architecture before coding' },
  { key: 'ai_collaboration',    label: 'AI Collaboration',     color: '#8b5cf6', desc: 'Prompt quality and critical evaluation of AI output' },
  { key: 'agent_orchestration', label: 'Agent Orchestration',  color: '#06b6d4', desc: 'Multi-agent delegation and parallel task management' },
  { key: 'debugging',           label: 'Debugging',            color: '#f59e0b', desc: 'Systematic diagnosis vs trial-and-error' },
  { key: 'code_quality',        label: 'Code Quality',         color: '#22c55e', desc: 'Diff review, test coverage, no shortcuts' },
  { key: 'communication',       label: 'Communication',        color: '#ef4444', desc: 'Clear briefs and explicit context-setting' },
]

const s = {
  root: { fontFamily: "'Inter', sans-serif", background: 'var(--bg-section)', minHeight: '100vh' },

  /* NAV */
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    transition: 'background 0.25s, box-shadow 0.25s',
    background: 'transparent',
  },
  navScrolled: {
    background: '#ffffff',
    boxShadow: '0 2px 20px rgba(10,22,40,0.08)',
  },
  navInner: {
    maxWidth: '1100px', margin: '0 auto', padding: '0 28px',
    height: '64px', display: 'flex', alignItems: 'center', gap: '32px',
  },
  navLogo: {
    fontSize: '18px', fontWeight: '800', letterSpacing: '-0.025em',
    color: 'var(--navy)', textDecoration: 'none', marginRight: 'auto',
  },
  logoGold: { color: 'var(--gold)' },
  navLinks: { display: 'flex', gap: '28px' },
  navLink: {
    fontSize: '13px', fontWeight: '500', color: 'var(--text-body)',
    textDecoration: 'none', letterSpacing: '0.01em',
  },
  navCta: {
    fontSize: '13px', fontWeight: '600', padding: '9px 20px',
    background: 'var(--navy)', color: '#fff', border: 'none',
    borderRadius: '3px', cursor: 'pointer', letterSpacing: '0.01em',
    fontFamily: 'inherit',
  },

  /* HERO */
  hero: {
    minHeight: '80vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '120px 28px 80px',
    background: 'var(--bg-section)',
  },
  heroContent: { maxWidth: '700px', textAlign: 'center' },
  eyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', justifyContent: 'center' },
  eyebrowLine: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowText: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  heroH1: {
    fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: '800',
    letterSpacing: '-0.035em', color: 'var(--text-head)',
    lineHeight: 1.1, marginBottom: '20px',
  },
  heroSubtitle: {
    fontSize: '16px', color: 'var(--text-body)', maxWidth: '520px',
    margin: '0 auto 36px', lineHeight: 1.75,
  },
  heroBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '36px', flexWrap: 'wrap' },
  btnPrimary: {
    background: 'var(--navy)', color: '#fff', border: 'none',
    borderRadius: '3px', padding: '14px 28px', fontSize: '15px',
    fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '0.01em',
  },
  btnSecondary: {
    background: 'transparent', color: 'var(--navy)',
    border: '1.5px solid var(--navy)', borderRadius: '3px',
    padding: '14px 28px', fontSize: '15px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.01em',
  },
  metricChips: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0', flexWrap: 'wrap',
    border: '1px solid var(--border)', borderRadius: '4px',
    background: '#fff', display: 'inline-flex',
  },
  chip: {
    fontSize: '12px', fontWeight: '600', color: 'var(--text-body)',
    padding: '10px 20px', letterSpacing: '0.02em',
  },
  chipDivider: { width: '1px', height: '20px', background: 'var(--border)' },

  /* SECTION SHARED */
  sectionContainer: { maxWidth: '1100px', margin: '0 auto', padding: '0 28px' },
  sectionEyebrow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' },
  sectionH2: { fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-head)', marginBottom: '48px' },

  /* HOW IT WORKS */
  hiwSection: { background: 'var(--bg-light)', padding: '100px 0' },
  stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' },
  stepCard: {
    background: '#fff', border: '1px solid var(--border)',
    borderLeft: '3px solid var(--gold)', borderRadius: '6px',
    padding: '28px 24px',
  },
  stepNum: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.3)',
    color: 'var(--gold)', fontSize: '13px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '16px', letterSpacing: '0.04em',
  },
  stepTitle: { fontSize: '16px', fontWeight: '700', color: 'var(--text-head)', marginBottom: '10px', letterSpacing: '-0.01em' },
  stepDesc: { fontSize: '14px', color: 'var(--text-body)', lineHeight: 1.65 },

  /* SCORING AXES */
  scoringSection: { background: 'var(--bg-section)', padding: '100px 0' },
  axesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  axisCard: { background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px' },
  axisCardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  axisDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  axisCardLabel: { fontSize: '15px', fontWeight: '700', color: 'var(--text-head)', letterSpacing: '-0.01em' },
  axisCardDesc: { fontSize: '14px', color: 'var(--text-body)', lineHeight: 1.6 },

  /* CTA */
  ctaSection: { background: 'var(--navy)', padding: '100px 0' },
  ctaInner: { maxWidth: '700px', margin: '0 auto', padding: '0 28px', textAlign: 'center' },
  ctaEyebrow: { display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '20px' },
  eyebrowLineDark: { width: '28px', height: '1px', background: 'var(--gold)', flexShrink: 0 },
  eyebrowTextDark: { fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' },
  ctaH2: { fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-0.03em', color: '#fff', marginBottom: '16px' },
  ctaSubtitle: { fontSize: '16px', color: 'var(--text-light)', lineHeight: 1.7, marginBottom: '36px' },
  ctaBtn: {
    background: 'var(--gold)', color: 'var(--navy)', border: 'none',
    borderRadius: '3px', padding: '15px 32px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit',
    letterSpacing: '0.01em',
  },

  /* FOOTER */
  footer: { background: 'var(--navy)', borderTop: '1px solid var(--border-dark)', padding: '40px 0' },
  footerInner: {
    maxWidth: '1100px', margin: '0 auto', padding: '0 28px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '16px',
  },
  footerLogo: { fontSize: '16px', fontWeight: '800', letterSpacing: '-0.025em', color: '#fff', marginBottom: '4px' },
  footerTagline: { fontSize: '12px', color: 'var(--text-light)', letterSpacing: '0.02em' },
  footerCopy: { fontSize: '12px', color: 'var(--text-light)' },
}
