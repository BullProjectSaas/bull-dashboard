import { C } from '../theme'

export default function Spinner({ label = 'Cargando datos…' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        minHeight: '60vh',
        color: C.muted,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `3px solid ${C.border}`,
          borderTopColor: C.gold,
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 14, letterSpacing: 0.3 }}>{label}</span>
    </div>
  )
}
