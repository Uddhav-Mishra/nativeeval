export default function RadarChart({ scores, axes }) {
  const size = 280
  const cx = size / 2
  const cy = size / 2
  const radius = 100
  const n = axes.length

  function getPoint(index, value, maxValue = 10) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const r = (value / maxValue) * radius
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  function getLabelPoint(index) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2
    const r = radius + 24
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  const rings = [2, 4, 6, 8, 10].map(v => {
    const points = axes.map((_, i) => { const pt = getPoint(i, v); return `${pt.x},${pt.y}` }).join(' ')
    return <polygon key={v} points={points} fill="none" stroke="rgba(10,22,40,0.12)" strokeWidth="1" />
  })

  const spokes = axes.map((_, i) => {
    const pt = getPoint(i, 10)
    return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(10,22,40,0.12)" strokeWidth="1" />
  })

  const scorePoints = axes.map((axis, i) => {
    const score = scores[axis.key]?.score || 0
    const pt = getPoint(i, score)
    return `${pt.x},${pt.y}`
  }).join(' ')

  const dots = axes.map((axis, i) => {
    const score = scores[axis.key]?.score || 0
    const pt = getPoint(i, score)
    return <circle key={i} cx={pt.x} cy={pt.y} r="4" fill={axis.color} stroke="#fff" strokeWidth="2" />
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      {spokes}
      <polygon points={scorePoints} fill="rgba(201,168,76,0.12)" stroke="#C9A84C" strokeWidth="2" strokeLinejoin="round" />
      {dots}
      {axes.map((axis, i) => {
        const pt = getLabelPoint(i)
        const score = scores[axis.key]?.score || 0
        return (
          <g key={i}>
            <text x={pt.x} y={pt.y - 6} textAnchor="middle" fill="#7A7A7A" fontSize="10" fontFamily="Inter, sans-serif">{axis.label}</text>
            <text x={pt.x} y={pt.y + 8} textAnchor="middle" fill={axis.color} fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif">{score}</text>
          </g>
        )
      })}
    </svg>
  )
}
