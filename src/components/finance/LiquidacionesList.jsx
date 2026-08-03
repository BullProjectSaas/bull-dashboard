import { C } from '../../theme'
import Section from '../Section'
import { useLiquidations } from '../../hooks/useLiquidations'
import { fmtMoney } from '../../utils/financeFormat'
import { downloadLiquidacionPdf } from '../../utils/liquidationPdf'

export default function LiquidacionesList() {
  const { liquidations, ready, error } = useLiquidations()

  return (
    <Section title="Historial de liquidaciones">
      {error && <p style={{ fontSize: 12, color: C.red, marginTop: 0 }}>No se pudo sincronizar con Firebase ({error}).</p>}
      {!ready ? (
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Cargando…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {liquidations.map((liq) => (
            <div
              key={liq.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13, flex: '1 1 160px' }}>{liq.clientName}</span>
              <span style={{ fontSize: 12, color: C.muted, width: 80 }}>{liq.month}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.gold, width: 150 }}>Comisión: {fmtMoney(liq.comisionTotal)}</span>
              <span style={{ fontSize: 12, color: C.muted, width: 160 }}>Equipo: {fmtMoney(liq.fondoEquipo)} / Bull: {fmtMoney(liq.fondoBull)}</span>
              <button
                onClick={() => downloadLiquidacionPdf(liq, liq.roleAssignments || [])}
                style={{ marginLeft: 'auto', background: 'transparent', color: C.gold, border: `1px solid ${C.gold}55`, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Descargar PDF
              </button>
            </div>
          ))}
          {!liquidations.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Todavía no se generó ninguna liquidación.</p>}
        </div>
      )}
    </Section>
  )
}
