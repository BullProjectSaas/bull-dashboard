import { useState } from 'react'
import { C } from '../../theme'
import LiquidacionBuilder from './LiquidacionBuilder'
import LiquidacionesList from './LiquidacionesList'

const SUBTABS = [
  { key: 'nueva', label: 'Nueva liquidación' },
  { key: 'historial', label: 'Historial' },
]

export default function LiquidacionesPanel({ settings, userEmail }) {
  const [subtab, setSubtab] = useState('nueva')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {SUBTABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubtab(t.key)}
            style={{
              background: subtab === t.key ? C.gold : C.bg3,
              color: subtab === t.key ? C.bg : C.muted,
              border: `1px solid ${subtab === t.key ? C.gold : C.border}`,
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: subtab === t.key ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subtab === 'nueva' && <LiquidacionBuilder settings={settings} userEmail={userEmail} />}
      {subtab === 'historial' && <LiquidacionesList />}
    </div>
  )
}
