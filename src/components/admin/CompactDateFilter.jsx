import { useState } from 'react'
import { C } from '../../theme'
import { toDateKey } from '../../utils/metrics'

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
const shortDate = (k) => {
  const [, m, d] = k.split('-')
  return `${d}/${m}`
}

function rangeLabel(range) {
  if (!range.from && !range.to) return 'Todo el período'
  const preset = PRESETS.find((p) => p.from === range.from && p.to === range.to)
  if (preset) return preset.label
  return `${range.from ? shortDate(range.from) : '…'} – ${range.to ? shortDate(range.to) : '…'}`
}

const inputStyle = {
  background: C.bg,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  padding: '7px 10px',
  fontSize: 13,
}

export default function CompactDateFilter({ range, onChange }) {
  const [open, setOpen] = useState(false)
  const [fromInput, setFromInput] = useState(range.from)
  const [toInput, setToInput] = useState(range.to)
  const active = Boolean(range.from && range.to)

  const apply = () => {
    onChange({ from: fromInput, to: toInput })
    setOpen(false)
  }

  const preset = (from, to) => {
    setFromInput(from)
    setToInput(to)
    onChange({ from, to })
    setOpen(false)
  }

  const reset = () => {
    setFromInput('')
    setToInput('')
    onChange({ from: '', to: '' })
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: active ? 'rgba(201,168,76,0.08)' : C.bg3,
          color: active ? C.gold : C.text,
          border: `1px solid ${active ? 'rgba(201,168,76,0.35)' : C.border}`,
          borderRadius: 999,
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {rangeLabel(range)}
        <span style={{ fontSize: 10, opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 10,
            background: C.bg2,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxShadow: '0 16px 32px -12px rgba(0,0,0,0.6)',
            minWidth: 320,
          }}
        >
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => preset(p.from, p.to)}
                style={{
                  background: C.bg3,
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 999,
                  padding: '5px 11px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: C.muted }}>
              Desde
              <input type="date" value={fromInput} onChange={(e) => setFromInput(e.target.value)} style={inputStyle} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: C.muted }}>
              Hasta
              <input type="date" value={toInput} onChange={(e) => setToInput(e.target.value)} style={inputStyle} />
            </label>
            <button
              onClick={apply}
              style={{ background: C.gold, color: C.bg, border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
            >
              Aplicar
            </button>
            <button
              onClick={reset}
              style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer' }}
            >
              Resetear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
