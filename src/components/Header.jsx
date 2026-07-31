import { C } from '../theme'

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
  const shortId = sheetId ? `${sheetId.slice(0, 6)}…${sheetId.slice(-4)}` : '—'
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
        padding: '14px 24px',
        background: 'rgba(19,30,49,0.9)',
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="" width={30} height={25} style={{ display: 'block' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: C.text,
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            Bull Partners<span style={{ fontSize: 9, verticalAlign: 'super', color: C.gold }}>™</span>
          </h1>
          <span style={{ fontSize: 11, color: C.muted, opacity: 0.7 }}>Sheet {shortId}</span>
        </div>
      </div>

      <Pill dot={loading ? C.amber : C.green}>{loading ? 'Actualizando…' : `Actualizado ${updatedLabel}`}</Pill>
    </header>
  )
}
