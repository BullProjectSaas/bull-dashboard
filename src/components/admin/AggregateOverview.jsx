import { useEffect, useMemo, useState } from 'react'
import { C } from '../../theme'
import { fetchAllSheets } from '../../utils/googleSheets'
import { computeDashboard, filterByDateRange, fmtARS, fmtDays, fmtInt, fmtPct, fmtROAS, roasColor } from '../../utils/metrics'
import CompactDateFilter from './CompactDateFilter'
import ScoreCard from '../ScoreCard'
import Section from '../Section'

function computeForRange(raw, from, to) {
  const ventas = filterByDateRange(raw.ventas, 'Fecha de venta', from, to)
  const metricas = filterByDateRange(raw.metricas, 'Day', from, to)
  const tally = filterByDateRange(raw.tally, 'Fecha', from, to)
  return computeDashboard(ventas, metricas, tally)
}

export default function AggregateOverview({ clients }) {
  const [rawByClient, setRawByClient] = useState({})
  const [loading, setLoading] = useState(true)
  const [failedCount, setFailedCount] = useState(0)
  const [range, setRange] = useState({ from: '', to: '' })
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
        if (!raw) return { name: c.name, sheetId: c.sheetId, ok: false }
        const dash = computeForRange(raw, range.from, range.to)
        return { name: c.name, sheetId: c.sheetId, ok: true, ...dash.scorecards }
      }),
    [clients, rawByClient, range],
  )

  const totals = useMemo(() => {
    const ok = perClient.filter((c) => c.ok)
    const inversion = ok.reduce((a, c) => a + c.inversion, 0)
    const facturacion = ok.reduce((a, c) => a + c.facturacion, 0)
    const totalLeads = ok.reduce((a, c) => a + c.totalLeads, 0)
    const totalVentas = ok.reduce((a, c) => a + c.totalVentas, 0)
    const roasGlobal = inversion > 0 ? facturacion / inversion : 0
    const roasPromedio = ok.length ? ok.reduce((a, c) => a + c.roas, 0) / ok.length : 0
    return {
      clientesActivos: ok.length,
      inversion,
      facturacion,
      totalLeads,
      totalVentas,
      roasGlobal,
      roasPromedio,
      tasaCierre: totalLeads > 0 ? (totalVentas / totalLeads) * 100 : 0,
      cpl: totalLeads > 0 ? inversion / totalLeads : 0,
      costoPorVenta: totalVentas > 0 ? inversion / totalVentas : 0,
      ticket: totalVentas > 0 ? facturacion / totalVentas : 0,
    }
  }, [perClient])

  const rows = useMemo(() => [...perClient].sort((a, b) => (b.facturacion || 0) - (a.facturacion || 0)), [perClient])

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
        {failedCount > 0 && (
          <span style={{ fontSize: 12, color: C.red }}>{failedCount} cliente(s) no se pudieron cargar.</span>
        )}
      </div>

      {loading ? (
        <p style={{ color: C.muted, fontSize: 13 }}>Cargando datos de {clients.length} cliente(s)…</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <ScoreCard label="Clientes activos" value={fmtInt(totals.clientesActivos)} />
            <ScoreCard label="Inversión total" value={fmtARS(totals.inversion)} />
            <ScoreCard label="Facturación total" value={fmtARS(totals.facturacion)} color={C.gold} />
            <ScoreCard label="ROAS global" value={fmtROAS(totals.roasGlobal)} color={roasColor(totals.roasGlobal)} sub="Facturación / inversión" />
            <ScoreCard label="ROAS promedio" value={fmtROAS(totals.roasPromedio)} color={roasColor(totals.roasPromedio)} sub="Promedio simple entre clientes" />
            <ScoreCard label="Total Leads" value={fmtInt(totals.totalLeads)} />
            <ScoreCard label="Total Ventas" value={fmtInt(totals.totalVentas)} />
            <ScoreCard label="Tasa de Cierre" value={fmtPct(totals.tasaCierre)} />
            <ScoreCard label="CPL" value={fmtARS(totals.cpl)} />
            <ScoreCard label="Costo por Venta" value={fmtARS(totals.costoPorVenta)} />
            <ScoreCard label="Ticket Promedio" value={fmtARS(totals.ticket)} />
          </div>

          <Section title="Detalle por cliente">
            <div style={{ overflow: 'auto', maxHeight: 480 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                <thead>
                  <tr>
                    {['Cliente', 'Inversión', 'Facturación', 'ROAS', 'Leads', 'Ventas', 'Tasa Cierre', 'Tiempo Conv.'].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          textAlign: i === 0 ? 'left' : 'right',
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
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.sheetId}>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>
                        <a
                          href={`${import.meta.env.BASE_URL}?sheet=${c.sheetId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: C.text, textDecoration: 'none' }}
                        >
                          {c.name}
                        </a>
                      </td>
                      {c.ok ? (
                        <>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtARS(c.inversion)}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtARS(c.facturacion)}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: roasColor(c.roas), borderBottom: `1px solid ${C.border}` }}>
                            {fmtROAS(c.roas)}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtInt(c.totalLeads)}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtInt(c.totalVentas)}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtPct(c.tasaCierre)}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, textAlign: 'right', borderBottom: `1px solid ${C.border}` }}>{fmtDays(c.tiempoConvProm)}</td>
                        </>
                      ) : (
                        <td colSpan={7} style={{ padding: '10px 14px', fontSize: 12, color: C.red, borderBottom: `1px solid ${C.border}` }}>
                          No se pudo cargar este cliente.
                        </td>
                      )}
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={8} style={{ padding: '10px 14px', fontSize: 13, color: C.muted, textAlign: 'center' }}>
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
