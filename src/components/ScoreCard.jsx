import { C } from '../theme'

export default function ScoreCard({ label, value, color, sub, delta }) {
  return (
    <div
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 0,
        transition: 'border-color 0.15s ease',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.7 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: color || C.text, lineHeight: 1.1, letterSpacing: -0.3 }}>{value}</span>
      {delta !== undefined && delta !== null && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            width: 'fit-content',
            fontSize: 11,
            fontWeight: 700,
            color: delta >= 0 ? C.green : C.red,
            background: delta >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
        </span>
      )}
      {sub && <span style={{ fontSize: 11, color: C.muted }}>{sub}</span>}
    </div>
  )
}
