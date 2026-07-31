import { C } from '../../theme'
import { fmtROAS } from '../../utils/metrics'
import { tagColor } from '../../utils/clientTags'
import Section from '../Section'

export default function AlertsPanel({ clients }) {
  const flagged = clients.filter((c) => c.ok && c.alerts && (c.alerts.pausada || c.alerts.roasBajo))

  return (
    <Section title={`Necesita atención${flagged.length ? ` (${flagged.length})` : ''}`}>
      {!flagged.length ? (
        <p style={{ fontSize: 13, color: C.green, margin: 0 }}>✓ Ningún cliente con campañas pausadas o ROAS bajo en los últimos 30 días.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {flagged.map((c) => (
            <div
              key={c.sheetId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                background: 'rgba(239,68,68,0.06)',
                border: `1px solid rgba(239,68,68,0.25)`,
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <span style={{ flex: '1 1 140px', fontWeight: 700, fontSize: 13 }}>{c.name}</span>
              {c.celula && <span style={{ fontSize: 11, color: C.muted }}>{c.celula}</span>}
              {c.etiqueta && (
                <span style={{ fontSize: 10, fontWeight: 700, color: tagColor(c.etiqueta) }}>{c.etiqueta}</span>
              )}
              {c.alerts.pausada && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.amber,
                    background: 'rgba(245,158,11,0.14)',
                    borderRadius: 999,
                    padding: '3px 9px',
                  }}
                >
                  ⏸ Sin datos desde hace {c.alerts.diasSinActividad}d
                </span>
              )}
              {c.alerts.roasBajo && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.red,
                    background: 'rgba(239,68,68,0.14)',
                    borderRadius: 999,
                    padding: '3px 9px',
                  }}
                >
                  ROAS 30d {fmtROAS(c.alerts.roas30d)} · breakeven {c.alerts.roasBreakeven.toFixed(1)}x
                </span>
              )}
              <a
                href={`${import.meta.env.BASE_URL}?sheet=${c.sheetId}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: C.gold, textDecoration: 'none', fontWeight: 600 }}
              >
                Ver dashboard ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
