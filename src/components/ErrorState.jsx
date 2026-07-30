import { C } from '../theme'

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        minHeight: '60vh',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <div style={{ fontSize: 40 }}>⚠️</div>
      <h2 style={{ margin: 0, color: C.text, fontSize: 18 }}>No se pudieron cargar los datos</h2>
      <p style={{ margin: 0, color: C.muted, fontSize: 14, maxWidth: 480 }}>{message}</p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 8,
          background: C.gold,
          color: C.bg,
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          fontWeight: 700,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  )
}
