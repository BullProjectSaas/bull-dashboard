import { useState } from 'react'
import { C } from '../theme'
import { fmtDateShort } from '../utils/metrics'

const todayKey = () => new Date().toISOString().slice(0, 10)

export default function ActivitiesDateShortcut({ activities, onSelect }) {
  const [open, setOpen] = useState(false)

  const handlePick = (activity) => {
    onSelect({ from: activity.date, to: todayKey() })
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!activities.length}
        title={activities.length ? undefined : 'Todavía no hay actividades cargadas'}
        style={{
          background: open ? C.gold : 'transparent',
          color: open ? C.bg : activities.length ? C.text : C.muted,
          border: `1px solid ${open ? C.gold : C.border}`,
          borderRadius: 999,
          padding: '8px 14px',
          fontWeight: open ? 700 : 400,
          fontSize: 13,
          cursor: activities.length ? 'pointer' : 'not-allowed',
          opacity: activities.length ? 1 : 0.5,
        }}
      >
        Actividades
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              zIndex: 11,
              width: 320,
              maxHeight: 320,
              overflowY: 'auto',
              background: C.bg2,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <p style={{ fontSize: 11, color: C.muted, margin: '4px 8px 8px' }}>
              Elegí un cambio para ver las métricas desde esa fecha hasta hoy.
            </p>
            {activities.map((a) => (
              <button
                key={a.id}
                onClick={() => handlePick(a)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px',
                  fontSize: 12,
                  color: C.text,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.bg3)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: C.muted, width: 56, flexShrink: 0 }}>{fmtDateShort(a.date)}</span>
                <span style={{ color: C.gold, fontWeight: 700, flexShrink: 0 }}>{a.category}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
