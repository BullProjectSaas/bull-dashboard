import { C } from '../theme'
import { toDateKey } from '../utils/metrics'

const inputStyle = {
  background: C.bg2,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 13,
  fontFamily: 'inherit',
}

function getPresets() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const d = now.getDate()
  const iso = (dt) => toDateKey(dt)
  return [
    { label: 'Hoy', from: iso(new Date(y, m, d)), to: iso(new Date(y, m, d)) },
    { label: 'Últimos 7 días', from: iso(new Date(y, m, d - 6)), to: iso(new Date(y, m, d)) },
    { label: 'Últimos 30 días', from: iso(new Date(y, m, d - 29)), to: iso(new Date(y, m, d)) },
    { label: 'Este mes', from: iso(new Date(y, m, 1)), to: iso(new Date(y, m, d)) },
    { label: 'Mes anterior', from: iso(new Date(y, m - 1, 1)), to: iso(new Date(y, m, 0)) },
  ]
}

const PRESETS = getPresets()

export default function DateFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onApply,
  onReset,
  onPreset,
  active,
  compareEnabled,
  onToggleCompare,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px 24px',
        background: C.bg2,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
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
        <button
          onClick={onToggleCompare}
          disabled={!active}
          title={active ? undefined : 'Aplicá un rango de fechas para comparar'}
          style={{
            background: compareEnabled ? C.gold : 'transparent',
            color: compareEnabled ? C.bg : active ? C.text : C.muted,
            border: `1px solid ${compareEnabled ? C.gold : C.border}`,
            borderRadius: 6,
            padding: '9px 18px',
            fontWeight: compareEnabled ? 700 : 400,
            fontSize: 13,
            cursor: active ? 'pointer' : 'not-allowed',
            opacity: active ? 1 : 0.5,
          }}
        >
          Comparar vs. período anterior
        </button>
        {active && <span style={{ fontSize: 12, color: C.gold, marginLeft: 4 }}>Filtro activo</span>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onPreset(p.from, p.to)}
            style={{
              background: 'transparent',
              color: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: '5px 12px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
