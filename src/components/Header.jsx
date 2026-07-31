import { C } from '../theme'

function Mark() {
  return (
    <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0L26 24H16.5L13 17L9.5 24H0L13 0Z" fill={C.gold} />
      <path d="M13 6L20 20H15.8L13 14.5L10.2 20H6L13 6Z" fill={C.bg} />
    </svg>
  )
}

function Pill({ children, dot }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 12px',
        borderRadius: 999,
        border: `1px solid ${C.border}`,
        background: 'rgba(255,255,255,0.03)',
        fontSize: 12,
        color: C.muted,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />}
      {children}
    </span>
  )
}

export default function Header({ sheetId, updatedAt, loading }) {
  const shortId = sheetId ? `${sheetId.slice(0, 8)}…${sheetId.slice(-4)}` : '—'
  const updatedLabel = updatedAt
    ? updatedAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '16px 24px',
        background: 'rgba(27,47,78,0.92)',
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Mark />
        <h1
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 1.2,
            color: C.text,
            textTransform: 'uppercase',
          }}
        >
          Bull Partners<span style={{ fontSize: 10, verticalAlign: 'super', color: C.gold }}>™</span>
        </h1>
        <Pill dot={C.gold}>{shortId}</Pill>
      </div>

      <Pill dot={loading ? C.amber : C.green}>{loading ? 'Actualizando…' : `Actualizado ${updatedLabel}`}</Pill>
    </header>
  )
}
