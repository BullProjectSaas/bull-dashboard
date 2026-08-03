import { useMemo, useState } from 'react'
import { C } from '../../theme'
import Section from '../Section'
import { inputStyle, selectStyle } from '../admin/formStyles'
import { useClients } from '../../hooks/useClients'
import { useCollaborators } from '../../hooks/useCollaborators'
import { useLiquidations } from '../../hooks/useLiquidations'
import { fetchAllSheets } from '../../utils/googleSheets'
import { computeLiquidacion } from '../../utils/liquidationEngine'
import { fmtMoney } from '../../utils/financeFormat'
import { ROLE_LABELS } from '../../utils/financeDefaults'
import { downloadLiquidacionPdf } from '../../utils/liquidationPdf'

const currentMonthKey = () => new Date().toISOString().slice(0, 7)

const th = { textAlign: 'left', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 8px', borderBottom: `1px solid ${C.border}` }
const td = { fontSize: 12, color: C.text, padding: '6px 8px', borderBottom: `1px solid ${C.border}` }

function StatCard({ label, value, highlight }) {
  return (
    <div
      style={{
        flex: '1 1 130px',
        background: highlight ? 'rgba(201,168,76,0.1)' : C.bg3,
        border: `1px solid ${highlight ? C.gold + '55' : C.border}`,
        borderRadius: 10,
        padding: '10px 12px',
      }}
    >
      <div style={{ fontSize: 10, color: highlight ? C.gold : C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: highlight ? C.gold : C.text, marginTop: 4 }}>{value}</div>
    </div>
  )
}

function initAssignments(calc, collaborators) {
  return calc.roleSplits.map((rs) => {
    const candidate = collaborators.find((c) => c.role === rs.role && c.active)
    return {
      role: rs.role,
      collaboratorId: candidate?.id || '',
      collaboratorName: candidate?.name || '',
      pct: rs.pct,
      monto: rs.monto,
    }
  })
}

export default function LiquidacionBuilder({ settings, userEmail }) {
  const { clients, ready: clientsReady } = useClients(true)
  const { collaborators, ready: collabReady } = useCollaborators()
  const { saveLiquidacion } = useLiquidations()

  const [sheetId, setSheetId] = useState('')
  const [month, setMonth] = useState(currentMonthKey())
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [calc, setCalc] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const client = useMemo(() => clients.find((c) => c.sheetId === sheetId), [clients, sheetId])

  const traerDatos = async () => {
    if (!client) return
    setLoading(true)
    setLoadError(null)
    setCalc(null)
    setSaved(false)
    try {
      const { ventas, metricas, tally } = await fetchAllSheets(client.sheetId)
      const result = computeLiquidacion({
        client,
        month,
        ventasAll: ventas,
        metricasAll: metricas,
        tally,
        tramosEquipoBull: settings.tramosEquipoBull,
        nivelesReparto: settings.nivelesReparto,
      })
      setCalc(result)
      setAssignments(initAssignments(result, collaborators))
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateAssignment = (role, patch) => {
    setAssignments((rows) => rows.map((r) => (r.role === role ? { ...r, ...patch } : r)))
  }

  const guardar = async () => {
    setSaving(true)
    await saveLiquidacion(calc, assignments, userEmail).catch(() => {})
    setSaving(false)
    setSaved(true)
  }

  const missingConfig = client && (!client.nivelReparto || !(client.tramosComision || []).length)

  if (!settings) {
    return (
      <Section title="Nueva liquidación">
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          Todavía no se inicializó la configuración fija — andá a la pestaña "Configuración" y hacé click en "Inicializar configuración" primero.
        </p>
      </Section>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Section title="Nueva liquidación">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={sheetId} onChange={(e) => setSheetId(e.target.value)} style={selectStyle} disabled={!clientsReady}>
            <option value="">Cliente…</option>
            {clients.map((c) => (
              <option key={c.sheetId} value={c.sheetId}>{c.name}</option>
            ))}
          </select>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, flex: 'unset', width: 150 }} />
          <button
            onClick={traerDatos}
            disabled={!client || loading}
            style={{
              background: C.gold,
              color: C.bg,
              border: 'none',
              borderRadius: 10,
              padding: '9px 18px',
              fontWeight: 700,
              fontSize: 13,
              cursor: !client || loading ? 'default' : 'pointer',
              opacity: !client || loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Trayendo datos…' : 'Traer datos'}
          </button>
        </div>

        {missingConfig && (
          <p style={{ fontSize: 12, color: C.amber, marginTop: 12 }}>
            Este cliente no tiene nivel de reparto y/o tramos de comisión configurados — andá a "Config. clientes" antes de liquidar, o la comisión/reparto va a dar $0.
          </p>
        )}
        {loadError && <p style={{ fontSize: 12, color: C.red, marginTop: 12 }}>{loadError}</p>}
      </Section>

      {calc && (
        <>
          <Section title={`Métricas — ${calc.clientName} · ${calc.month}`}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatCard label="Facturación total" value={fmtMoney(calc.facturacionTotal)} />
              <StatCard label="Inversión pub." value={fmtMoney(calc.inversionPub)} />
              <StatCard label="Base comisionable" value={fmtMoney(calc.baseComisionable)} highlight />
              <StatCard label="ROAS" value={`${calc.roas.toFixed(1)}x`} />
              <StatCard label="Leads" value={String(calc.leadsGenerados)} />
              <StatCard label="Ventas" value={String(calc.numVentas)} />
              <StatCard label="% cierre" value={`${calc.tasaCierre.toFixed(1)}%`} />
              <StatCard label="Fact. recurrente" value={fmtMoney(calc.facturacionRecurrentes)} />
            </div>
          </Section>

          <Section title="Desglose de comisión">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
                <thead>
                  <tr><th style={th}>Tramo (ventas nuevas)</th><th style={th}>Base aplicada</th><th style={th}>%</th><th style={th}>Subtotal</th></tr>
                </thead>
                <tbody>
                  {calc.comisionNuevas.breakdown.map((b, i) => (
                    <tr key={i}>
                      <td style={td}>{fmtMoney(b.min)} – {fmtMoney(b.max)}</td>
                      <td style={td}>{fmtMoney(b.baseAplicada)}</td>
                      <td style={td}>{(b.rate * 100).toFixed(1)}%</td>
                      <td style={td}>{fmtMoney(b.monto)}</td>
                    </tr>
                  ))}
                  {!calc.comisionNuevas.breakdown.length && (
                    <tr><td style={td} colSpan={4}>Sin tramos configurados o base en $0.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {calc.recurrenciaActiva && (
              <p style={{ fontSize: 12, color: C.muted, margin: '0 0 10px' }}>
                Comisión ventas recurrentes: {fmtMoney(calc.facturacionRecurrentes)} × {(calc.recurrenciaPct * 100).toFixed(1)}% = <strong style={{ color: C.text }}>{fmtMoney(calc.comisionRecurrente)}</strong>
              </p>
            )}

            <p style={{ fontSize: 15, fontWeight: 800, color: C.gold, margin: 0 }}>
              Comisión total a cobrar: {fmtMoney(calc.comisionTotal)}
            </p>
          </Section>

          <Section title="Distribución interna del equipo">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
                <thead>
                  <tr><th style={th}>Tramo</th><th style={th}>Base aplicada</th><th style={th}>% Equipo</th><th style={th}>Subtotal</th></tr>
                </thead>
                <tbody>
                  {calc.equipoBull.breakdown.map((b, i) => (
                    <tr key={i}>
                      <td style={td}>{fmtMoney(b.min)} – {fmtMoney(b.max)}</td>
                      <td style={td}>{fmtMoney(b.baseAplicada)}</td>
                      <td style={td}>{(b.rate * 100).toFixed(1)}%</td>
                      <td style={td}>{fmtMoney(b.monto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 14px' }}>
              Fondo total del equipo: {fmtMoney(calc.fondoEquipo)} — Fondo de Bull: {fmtMoney(calc.fondoBull)}
            </p>

            {!collabReady ? (
              <p style={{ fontSize: 13, color: C.muted }}>Cargando colaboradores…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {assignments.map((a) => (
                  <div key={a.role} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
                    <span style={{ width: 90, fontSize: 12, fontWeight: 700, color: C.muted }}>{ROLE_LABELS[a.role] || a.role}</span>
                    <select
                      value={a.collaboratorId}
                      onChange={(e) => {
                        const c = collaborators.find((x) => x.id === e.target.value)
                        updateAssignment(a.role, { collaboratorId: e.target.value, collaboratorName: c?.name || '' })
                      }}
                      style={{ ...selectStyle, minWidth: 180, padding: '7px 10px' }}
                    >
                      <option value="">Sin asignar</option>
                      {collaborators.filter((c) => c.role === a.role).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}{c.active ? '' : ' (inactivo)'}</option>
                      ))}
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
                      %
                      <input
                        type="number"
                        step="0.1"
                        value={(a.pct * 100).toFixed(1)}
                        onChange={(e) => {
                          const pct = (Number(e.target.value) || 0) / 100
                          updateAssignment(a.role, { pct, monto: calc.fondoEquipo * pct })
                        }}
                        style={{ ...inputStyle, flex: 'unset', width: 70, padding: '6px 8px' }}
                      />
                    </label>
                    <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 800 }}>{fmtMoney(a.monto)}</span>
                  </div>
                ))}
                {!assignments.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Configurá el nivel de reparto de este cliente en "Config. clientes".</p>}
              </div>
            )}
          </Section>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={guardar}
              disabled={saving}
              style={{ background: C.gold, color: C.bg, border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Guardando…' : 'Guardar liquidación'}
            </button>
            <button
              onClick={() => downloadLiquidacionPdf(calc, assignments)}
              style={{ background: 'transparent', color: C.gold, border: `1px solid ${C.gold}`, borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              Descargar PDF
            </button>
            {saved && <span style={{ fontSize: 12, color: C.green }}>✓ Liquidación guardada y transferencias creadas como pendientes.</span>}
          </div>
        </>
      )}
    </div>
  )
}
