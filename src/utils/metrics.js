import { C } from '../theme'

// ---------- formatters ----------

export const fmtARS = (v) =>
  !v ? '—' : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}k` : `$${v.toFixed(0)}`

export const fmtROAS = (v) => (v ? `${v.toFixed(1)}x` : '—')
export const fmtPct = (v) => (v ? `${v.toFixed(1)}%` : '—')
export const fmtDays = (v) => (v ? `${v.toFixed(1)}d` : '—')
export const fmtInt = (v) => (v || v === 0 ? Math.round(v).toLocaleString('es-AR') : '—')
export const roasColor = (v) => (v >= 8 ? C.green : v >= 4 ? C.amber : C.red)

export const fmtDateShort = (dateKey) => {
  if (!dateKey) return '—'
  const [, m, d] = dateKey.split('-')
  return `${d}/${m}`
}

// ---------- primitives ----------

export const num = (v) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export const sum = (arr, key) => arr.reduce((acc, r) => acc + num(r[key]), 0)

export const avg = (arr, key) => {
  const vals = arr.filter((r) => r[key] !== null && r[key] !== undefined && r[key] !== '').map((r) => num(r[key]))
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const clean = (v) => (v !== null && v !== undefined && String(v).trim() !== '' ? String(v).trim() : null)

export const getAttribution = (row) => clean(row['Origen ad tally']) || clean(row['Anuncio de Origen']) || 'Sin atribución'

export const normalizeZona = (v) => {
  const s = clean(v)
  if (!s) return 'Sin especificar'
  return s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}

export const toDateKey = (v) => {
  if (v === null || v === undefined || v === '') return null
  const d = v instanceof Date ? v : new Date(v)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function filterByDateRange(rows, field, from, to) {
  if (!from && !to) return rows
  return rows.filter((r) => {
    const key = toDateKey(r[field])
    if (!key) return false
    if (from && key < from) return false
    if (to && key > to) return false
    return true
  })
}

// ---------- aggregations ----------

function computeByAd(ventas, metricas, tally) {
  const map = new Map()
  const get = (name) => {
    const key = clean(name) || 'Sin atribución'
    if (!map.has(key)) map.set(key, { ad: key, gasto: 0, facturacion: 0, ventasCount: 0, leadsCount: 0 })
    return map.get(key)
  }

  for (const r of metricas) get(r['Ad Name']).gasto += num(r['Amount Spent'])
  for (const r of ventas) {
    const entry = get(getAttribution(r))
    entry.facturacion += num(r['Monto de Venta'])
    entry.ventasCount += 1
  }
  for (const r of tally) get(r['utm_content']).leadsCount += 1

  return Array.from(map.values())
    .map((e) => ({
      ...e,
      roas: e.gasto > 0 ? e.facturacion / e.gasto : 0,
      cpl: e.leadsCount > 0 ? e.gasto / e.leadsCount : 0,
      costoPorVenta: e.ventasCount > 0 ? e.gasto / e.ventasCount : 0,
      tasaCierre: e.leadsCount > 0 ? (e.ventasCount / e.leadsCount) * 100 : 0,
      ticket: e.ventasCount > 0 ? e.facturacion / e.ventasCount : 0,
    }))
    .sort((a, b) => b.facturacion - a.facturacion)
}

const ZONA_FIELD = '¿De qué localidad/zona sos @Tu nombre ?'

function computeByZona(tally) {
  const map = new Map()
  for (const r of tally) {
    const zona = normalizeZona(r[ZONA_FIELD])
    map.set(zona, (map.get(zona) || 0) + 1)
  }
  const total = tally.length
  return Array.from(map.entries())
    .map(([zona, leads]) => ({ zona, leads, pct: total > 0 ? (leads / total) * 100 : 0 }))
    .sort((a, b) => b.leads - a.leads)
}

function computeByProducto(ventas) {
  const map = new Map()
  for (const r of ventas) {
    const key = clean(r['Producto Vendido']) || 'Sin especificar'
    if (!map.has(key)) map.set(key, { producto: key, ventas: 0, facturacion: 0 })
    const entry = map.get(key)
    entry.ventas += 1
    entry.facturacion += num(r['Monto de Venta'])
  }
  return Array.from(map.values())
    .map((e) => ({ ...e, ticket: e.ventas > 0 ? e.facturacion / e.ventas : 0 }))
    .sort((a, b) => b.facturacion - a.facturacion)
}

function computeDaily(ventas, metricas) {
  const spendByDate = new Map()
  for (const r of metricas) {
    const key = toDateKey(r['Day'])
    if (!key) continue
    spendByDate.set(key, (spendByDate.get(key) || 0) + num(r['Amount Spent']))
  }
  const revenueByDate = new Map()
  for (const r of ventas) {
    const key = toDateKey(r['Fecha de venta'])
    if (!key) continue
    revenueByDate.set(key, (revenueByDate.get(key) || 0) + num(r['Monto de Venta']))
  }
  const dates = Array.from(new Set([...spendByDate.keys(), ...revenueByDate.keys()])).sort()

  let accInversion = 0
  let accFacturacion = 0
  return dates.map((date) => {
    accInversion += spendByDate.get(date) || 0
    accFacturacion += revenueByDate.get(date) || 0
    return {
      date,
      inversion: spendByDate.get(date) || 0,
      facturacion: revenueByDate.get(date) || 0,
      inversionAcum: accInversion,
      facturacionAcum: accFacturacion,
    }
  })
}

export function computeDashboard(ventas, metricas, tally) {
  const inversion = sum(metricas, 'Amount Spent')
  const facturacion = sum(ventas, 'Monto de Venta')
  const totalLeads = tally.length
  const totalVentas = ventas.length

  const scorecards = {
    inversion,
    facturacion,
    roas: inversion > 0 ? facturacion / inversion : 0,
    totalLeads,
    totalVentas,
    tasaCierre: totalLeads > 0 ? (totalVentas / totalLeads) * 100 : 0,
    cpl: totalLeads > 0 ? inversion / totalLeads : 0,
    costoPorVenta: totalVentas > 0 ? inversion / totalVentas : 0,
    ticket: totalVentas > 0 ? facturacion / totalVentas : 0,
    tiempoConvProm: avg(ventas, 'Tiempo de conversión'),
  }

  return {
    scorecards,
    byAd: computeByAd(ventas, metricas, tally),
    byZona: computeByZona(tally),
    byProducto: computeByProducto(ventas),
    daily: computeDaily(ventas, metricas),
  }
}
