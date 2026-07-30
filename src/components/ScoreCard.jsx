import { C } from '../theme'

export default function ScoreCard({ label, value, color, sub }) {
  return (
    <div
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: color || C.text, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
    </div>
  )
}
