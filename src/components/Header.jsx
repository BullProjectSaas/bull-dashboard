import { C } from '../theme'

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
        background: C.navy,
        borderBottom: `1px solid ${C.border}`,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🐂</span>
        <h1
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: 1.5,
            color: C.gold,
            textTransform: 'uppercase',
          }}
        >
          Bull Partners<span style={{ fontSize: 10, verticalAlign: 'super' }}>™</span>
        </h1>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: 'monospace' }}>{shortId}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.muted }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: loading ? C.amber : C.green,
            display: 'inline-block',
          }}
        />
        <span>{loading ? 'Actualizando…' : `Última actualización: ${updatedLabel}`}</span>
      </div>
    </header>
  )
}
