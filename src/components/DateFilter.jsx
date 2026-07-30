import { C } from '../theme'

const inputStyle = {
  background: C.bg2,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 13,
  fontFamily: 'inherit',
}

export default function DateFilter({ from, to, onFromChange, onToChange, onApply, onReset, active }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        flexWrap: 'wrap',
        padding: '16px 24px',
        background: C.bg2,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: C.muted }}>
        Desde
        <input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} style={inputStyle} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: C.muted }}>
        Hasta
        <input type="date" value={to} onChange={(e) => onToChange(e.target.value)} style={inputStyle} />
      </label>
      <button
        onClick={onApply}
        style={{
          background: C.gold,
          color: C.bg,
          border: 'none',
          borderRadius: 6,
          padding: '9px 18px',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Aplicar
      </button>
      <button
        onClick={onReset}
        style={{
          background: 'transparent',
          color: C.muted,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: '9px 18px',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Resetear
      </button>
      {active && (
        <span style={{ fontSize: 12, color: C.gold, marginLeft: 4 }}>Filtro activo</span>
      )}
    </div>
  )
}
