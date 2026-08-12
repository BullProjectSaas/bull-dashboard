import { useEffect, useMemo, useState } from 'react'
import { C } from '../../theme'
import { fetchAllSheets } from '../../utils/googleSheets'
import { computeDashboard, filterByDateRange, fmtARS, fmtDays, fmtInt, fmtPct, fmtROAS, roasColor } from '../../utils/metrics'
import { computeClientAlerts } from '../../utils/alerts'
import { tagColor, CLIENT_TAG_PAUSADO } from '../../utils/clientTags'
import CompactDateFilter from './CompactDateFilter'
import AlertsPanel from './AlertsPanel'
import ScoreCard from '../ScoreCard'
import Section from '../Section'

function computeForRange(raw, from, to) {
  const ventas = filterByDateRange(raw.ventas, 'Fecha de venta', from, to)
  const metricas = filterByDateRange(raw.metricas, 'Day', from, to)
  const tally = filterByDateRange(raw.tally, 'Fecha', from, to)
  // Full, unfiltered lead history for phone-based attribution — see ClientDashboard.jsx for why.
  return computeDashboard(ventas, metricas, tally, raw.tally)
}

function aggregate(list) {
  const inversion = list.reduce((a, c) => a + c.inversion, 0)
  const facturacion = list.reduce((a, c) => a + c.facturacion, 0)
  const totalLeads = list.reduce((a, c) => a + c.totalLeads, 0)
  const totalVentas = list.reduce((a, c) => a + c.totalVentas, 0)
  // CPL es un promedio entre clientes (no gasto total / leads totales): un cliente con
  // muchos leads no debe "diluir" el CPL de los demás.
  const conLeads = list.filter((c) => c.totalLeads > 0)
  return {
    clientesActivos: list.length,
    inversion,
    facturacion,
    totalLeads,
    totalVentas,
    roasGlobal: inversion > 0 ? facturacion / inversion : 0,
    roasPromedio: list.length ? list.reduce((a, c) => a + c.roas, 0) / list.length : 0,
    tasaCierre: totalLeads > 0 ? (totalVentas / totalLeads) * 100 : 0,
    cpl: conLeads.length ? conLeads.reduce((a, c) => a + c.cpl, 0) / conLeads.length : 0,
    costoPorVenta: totalVentas > 0 ? inversion / totalVentas : 0,
    ticket: totalVentas > 0 ? facturacion / totalVentas : 0,
  }
}

const th = {
  padding: '10px 14px',
  fontSize: 11,
  color: C.muted,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  background: C.bg2,
}
const td = { padding: '10px 14px', fontSize: 13, borderBottom: `1px solid ${C.border}` }

export default function AggregateOverview({ clients }) {
  const [rawByClient, setRawByClient] = useState({})
  const [loading, setLoading] = useState(true)
  const [failedCount, setFailedCount] = useState(0)
  const [range, setRange] = useState({ from: '', to: '' })
  const [celulaFilter, setCelulaFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!clients.length) {
      setRawByClient({})
      setLoading(false)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    Promise.allSettled(clients.map((c) => fetchAllSheets(c.sheetId))).then((results) => {
      if (cancelled) return
      const next = {}
      let failed = 0
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          next[clients[i].sheetId] = r.value
        } else {
          failed += 1
        }
      })
      setRawByClient(next)
      setFailedCount(failed)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, refreshKey])

  const perClient = useMemo(
    () =>
      clients.map((c) => {
        const raw = rawByClient[c.sheetId]
        if (!raw) return { name: c.name, sheetId: c.sheetId, celula: c.celula, etiqueta: c.etiqueta, ok: false }
        const dash = computeForRange(raw, range.from, range.to)
        const alerts = computeClientAlerts(raw, c.roasBreakeven)
        // Un cliente ya marcado como PAUSADO a mano no necesita que la alerta se lo
        // repita — esa alerta es para pausas inesperadas, no para las que ya sabés.
        if (c.etiqueta === CLIENT_TAG_PAUSADO) alerts.pausada = false
        return {
          name: c.name,
          sheetId: c.sheetId,
          celula: c.celula,
          etiqueta: c.etiqueta,
          ok: true,
          alerts,
          ...dash.scorecards,
        }
      }),
    [clients, rawByClient, range],
  )

  const celulas = useMemo(() => Array.from(new Set(clients.map((c) => c.celula).filter(Boolean))).sort(), [clients])

  const visible = useMemo(
    () => (celulaFilter ? perClient.filter((c) => c.celula === celulaFilter) : perClient),
    [perClient, celulaFilter],
  )

  const totals = useMemo(() => aggregate(visible.filter((c) => c.ok)), [visible])

  const byCelula = useMemo(() => {
    const ok = perClient.filter((c) => c.ok)
    const groups = new Map()
    for (const c of ok) {
      const key = c.celula || 'Sin célula'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(c)
    }
    return Array.from(groups.entries())
      .map(([celula, list]) => ({ celula, ...aggregate(list) }))
      .sort((a, b) => b.facturacion - a.facturacion)
  }, [perClient])

  const rows = useMemo(() => [...visible].sort((a, b) => (b.facturacion || 0) - (a.facturacion || 0)), [visible])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <CompactDateFilter range={range} onChange={setRange} />
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={loading}
          style={{
            background: C.bg3,
            color: C.muted,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 13,
            cursor: loading ? 'default' : 'pointer',
          }}
        >
          {loading ? 'Actualizando…' : 'Actualizar datos de todos los clientes'}
        </button>
        {celulas.length > 0 && (
          <select
            value={celulaFilter}
            onChange={(e) => setCelulaFilter(e.target.value)}
            style={{ background: C.bg3, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 12px', fontSize: 13 }}
          >
            <option value="">Todas las células</option>
            {celulas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
        {failedCount > 0 && (
          <span style={{ fontSize: 12, color: C.red }}>{failedCount} cliente(s) no se pudieron cargar.</span>
        )}
      </div>

      {loading ? (
        <p style={{ color: C.muted, fontSize: 13 }}>Cargando datos de {clients.length} cliente(s)…</p>
      ) : (
        <>
          <AlertsPanel clients={perClient} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <ScoreCard label="Clientes activos" value={fmtInt(totals.clientesActivos)} />
            <ScoreCard label="Inversión total" value={fmtARS(totals.inversion)} />
            <ScoreCard label="Facturación total" value={fmtARS(totals.facturacion)} color={C.gold} />
            <ScoreCard label="ROAS global" value={fmtROAS(totals.roasGlobal)} color={roasColor(totals.roasGlobal)} sub="Facturación / inversión" />
            <ScoreCard label="ROAS promedio" value={fmtROAS(totals.roasPromedio)} color={roasColor(totals.roasPromedio)} sub="Promedio simple entre clientes" />
            <ScoreCard label="Total Leads" value={fmtInt(totals.totalLeads)} />
            <ScoreCard label="Total Ventas" value={fmtInt(totals.totalVentas)} />
            <ScoreCard label="Tasa de Cierre" value={fmtPct(totals.tasaCierre)} />
            <ScoreCard label="CPL" value={fmtARS(totals.cpl)} sub="Promedio simple entre clientes" />
            <ScoreCard label="Costo por Venta" value={fmtARS(totals.costoPorVenta)} />
            <ScoreCard label="Ticket Promedio" value={fmtARS(totals.ticket)} />
          </div>

          {byCelula.length > 1 && (
            <Section title="Resultados por célula">
              <div style={{ overflow: 'auto', maxHeight: 360 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign: 'left' }}>Célula</th>
                      <th style={{ ...th, textAlign: 'right' }}>Clientes</th>
                      <th style={{ ...th, textAlign: 'right' }}>Inversión</th>
                      <th style={{ ...th, textAlign: 'right' }}>Facturación</th>
                      <th style={{ ...th, textAlign: 'right' }}>ROAS</th>
                      <th style={{ ...th, textAlign: 'right' }}>Leads</th>
                      <th style={{ ...th, textAlign: 'right' }}>Ventas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCelula.map((g) => (
                      <tr key={g.celula}>
                        <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{g.celula}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{fmtInt(g.clientesActivos)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{fmtARS(g.inversion)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{fmtARS(g.facturacion)}</td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: roasColor(g.roasGlobal) }}>{fmtROAS(g.roasGlobal)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{fmtInt(g.totalLeads)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{fmtInt(g.totalVentas)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          <Section title="Detalle por cliente">
            <div style={{ overflow: 'auto', maxHeight: 480 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
                <thead>
                  <tr>
                    {['Cliente', 'Célula', 'Etiqueta', 'Inversión', 'Facturación', 'ROAS', 'Leads', 'Ventas', 'Tasa Cierre', 'Tiempo Conv.'].map((h, i) => (
                      <th key={h} style={{ ...th, textAlign: i < 3 ? 'left' : 'right' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.sheetId}>
                      <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>
                        <a href={`${import.meta.env.BASE_URL}?sheet=${c.sheetId}`} target="_blank" rel="noreferrer" style={{ color: C.text, textDecoration: 'none' }}>
                          {c.name}
                        </a>
                      </td>
                      <td style={{ ...td, textAlign: 'left', color: C.muted }}>{c.celula || '—'}</td>
                      <td style={{ ...td, textAlign: 'left' }}>
                        {c.etiqueta ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: tagColor(c.etiqueta) }}>{c.etiqueta}</span>
                        ) : (
                          <span style={{ color: C.muted }}>—</span>
                        )}
                      </td>
                      {c.ok ? (
                        <>
                          <td style={{ ...td, textAlign: 'right' }}>{fmtARS(c.inversion)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{fmtARS(c.facturacion)}</td>
                          <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: roasColor(c.roas) }}>{fmtROAS(c.roas)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{fmtInt(c.totalLeads)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{fmtInt(c.totalVentas)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{fmtPct(c.tasaCierre)}</td>
                          <td style={{ ...td, textAlign: 'right' }}>{fmtDays(c.tiempoConvProm)}</td>
                        </>
                      ) : (
                        <td colSpan={7} style={{ ...td, color: C.red }}>
                          No se pudo cargar este cliente.
                        </td>
                      )}
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={10} style={{ ...td, color: C.muted, textAlign: 'center' }}>
                        Agregá clientes arriba para ver el resumen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
