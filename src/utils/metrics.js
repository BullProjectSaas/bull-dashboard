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

// Google Sheets headers can carry stray whitespace/casing/accents/underscores depending on
// how the sheet was set up (e.g. a hidden Tally field named "utm_content" in code often gets
// typed as "UTM Content" in the sheet) \u2014 resolve fields tolerantly instead of failing
// silently on a mismatch.
const normKey = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function field(row, name) {
  if (name in row) return row[name]
  const target = normKey(name)
  for (const key of Object.keys(row)) {
    if (normKey(key) === target) return row[key]
  }
  // Some sheets append extra text to a column name (e.g. "Tiempo de conversión (Días)"
  // instead of "Tiempo de conversión") — fall back to a prefix match.
  for (const key of Object.keys(row)) {
    const nk = normKey(key)
    if (nk.startsWith(target) || target.startsWith(nk)) return row[key]
  }
  return null
}

export const sum = (arr, key) => arr.reduce((acc, r) => acc + num(field(r, key)), 0)

export const avg = (arr, key) => {
  const vals = arr
    .map((r) => field(r, key))
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map((v) => num(v))
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export const clean = (v) => (v !== null && v !== undefined && String(v).trim() !== '' ? String(v).trim() : null)

// The ad-metrics importer used to write a generic "Results" column; it now writes "Tally
// Leads" instead (so the count is explicitly leads, not whatever conversion a given ad
// campaign happens to optimize for). Try the new name first, fall back to the old one for
// any sheet that hasn't been updated — `??` (not `||`) so a real 0 doesn't get overridden.
const leadsResult = (row) => field(row, 'Tally Leads') ?? field(row, 'Results')

// Last 5 digits of a phone number, tolerant of country code / formatting differences
// (+54 9 11..., 011..., with or without spaces/dashes).
const phoneSuffix = (v) => {
  const digits = String(v ?? '').replace(/\D/g, '')
  return digits.length >= 5 ? digits.slice(-5) : null
}

// Among phone-matching candidates, prefer the most recent one BEFORE the sale date
// (last-touch attribution) — falling back to the closest lead overall if none happened
// before the sale.
function pickBestCandidate(candidates, saleKey) {
  if (!candidates.length) return null

  const withDate = candidates.filter((c) => c.key)
  if (!withDate.length) return candidates[0].row

  const before = withDate.filter((c) => !saleKey || c.key <= saleKey).sort((a, b) => (a.key < b.key ? 1 : -1))
  if (before.length) return before[0].row

  const sorted = [...withDate].sort((a, b) => (a.key < b.key ? -1 : 1))
  return sorted[0].row
}

// Attribution computed by the dashboard itself instead of trusting whatever formula lives
// in the client's own Sheet: match the sale's phone number (last 5 digits) against Tally
// leads, and use the matched lead's utm_content.
function matchTallyByPhone(ventaRow, tally) {
  const suffix = phoneSuffix(field(ventaRow, 'Celular Cliente'))
  if (!suffix) return null

  const saleKey = toDateKey(field(ventaRow, 'Fecha de venta'))
  const candidates = tally
    .map((r) => ({
      row: r,
      phone: phoneSuffix(field(r, 'Tu número de celular')),
      key: toDateKey(field(r, 'Fecha')) || toDateKey(field(r, 'Submitted at')),
      hasContent: Boolean(clean(field(r, 'utm_content'))),
    }))
    .filter((c) => c.phone === suffix)

  // A same-phone submission with no utm_content (e.g. the organic leads form) shouldn't be
  // able to bump a perfectly good, ad-attributed lead into "Sin atribución" just because it
  // happened more recently — only fall back to a content-less match when nothing else exists.
  const withContent = candidates.filter((c) => c.hasContent)
  return pickBestCandidate(withContent, saleKey) || pickBestCandidate(candidates, saleKey)
}

export function getAttribution(row, tally) {
  if (tally) {
    const match = matchTallyByPhone(row, tally)
    const viaPhone = match ? clean(field(match, 'utm_content')) : null
    if (viaPhone) return viaPhone
  }
  return clean(field(row, 'Origen ad tally')) || clean(field(row, 'Anuncio de Origen')) || 'Sin atribución'
}

export const normalizeZona = (v) => {
  const s = clean(v)
  if (!s) return 'Sin especificar'
  return s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}

const pad2 = (n) => String(n).padStart(2, '0')

// Some client sheets store dates as plain text instead of a real Sheets date type
// (e.g. "22/06/2026" or "2026-02-27"). Parse those directly by their components instead
// of going through `new Date(string)`, which is ambiguous for "DD/MM/YYYY" (JS assumes
// MM/DD) and, for a date-only ISO string, applies UTC-midnight + local getters — that
// combination silently shifts the day for any timezone behind UTC.
export const toDateKey = (v) => {
  if (v === null || v === undefined || v === '') return null

  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null
    return `${v.getFullYear()}-${pad2(v.getMonth() + 1)}-${pad2(v.getDate())}`
  }

  const s = String(v).trim()

  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) {
    const [, y, m, d] = iso
    return `${y}-${pad2(m)}-${pad2(d)}`
  }

  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${pad2(m)}-${pad2(d)}`
  }

  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function filterByDateRange(rows, fieldName, from, to) {
  if (!from && !to) return rows
  return rows.filter((r) => {
    const key = toDateKey(field(r, fieldName))
    if (!key) return false
    if (from && key < from) return false
    if (to && key > to) return false
    return true
  })
}

// Parse a "YYYY-MM-DD" key (as produced by toDateKey / <input type="date">) into a local
// Date without going through `new Date(string)`, which reads ISO date-only strings as
// UTC midnight and would shift the day when combined with local date math.
const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (dateKey, n) => {
  const d = parseDateKey(dateKey)
  d.setDate(d.getDate() + n)
  return toDateKey(d)
}

// Equal-length period immediately preceding [from, to], for "compare to previous period".
export function previousPeriod(from, to) {
  if (!from || !to) return null
  const days = Math.round((parseDateKey(to) - parseDateKey(from)) / 86400000) + 1
  const prevTo = addDays(from, -1)
  const prevFrom = addDays(prevTo, -(days - 1))
  return { from: prevFrom, to: prevTo }
}

// Percentage change, or null when there's no meaningful baseline to compare against.
export const pctChange = (curr, prev) => (prev ? ((curr - prev) / Math.abs(prev)) * 100 : null)

// ---------- aggregations ----------

// `fullTally` (the whole, unfiltered lead history) is used only for phone-based attribution
// — a sale this month can easily come from a lead that arrived last month or earlier, so
// matching against the period-filtered `tally` would miss it and wrongly fall back to "Sin
// atribución". Lead-count-by-ad below intentionally keeps using the period-filtered `tally`,
// since "how many leads this ad generated in this period" is meant to stay period-scoped.
// Some clients don't run a per-lead capture form (no real Tally data — `tally` is always
// empty for them); their only signal of "leads" is the ad platform's own "Tally Leads"
// column (see `leadsResult` above). `excludedAdNames` lets a client exclude specific ads
// from that fallback — e.g. a nurture campaign optimized for profile visits, not lead gen.
function computeByAd(ventas, metricas, tally, fullTally = tally, excludedAdNames = []) {
  const excluded = new Set(excludedAdNames.map((n) => clean(n)).filter(Boolean))
  const map = new Map()
  const get = (name) => {
    const key = clean(name) || 'Sin atribución'
    if (!map.has(key)) map.set(key, { ad: key, gasto: 0, facturacion: 0, ventasCount: 0, leadsCount: 0 })
    return map.get(key)
  }

  for (const r of metricas) get(field(r, 'Ad Name')).gasto += num(field(r, 'Amount Spent'))
  for (const r of ventas) {
    const entry = get(getAttribution(r, fullTally))
    entry.facturacion += num(field(r, 'Monto de Venta'))
    entry.ventasCount += 1
  }
  if (tally.length > 0) {
    for (const r of tally) get(field(r, 'utm_content')).leadsCount += 1
  } else {
    for (const r of metricas) {
      const adName = clean(field(r, 'Ad Name'))
      if (adName && excluded.has(adName)) continue
      get(adName).leadsCount += num(leadsResult(r))
    }
  }

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
    const zona = normalizeZona(field(r, ZONA_FIELD))
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
    const key = clean(field(r, 'Producto Vendido')) || 'Sin especificar'
    if (!map.has(key)) map.set(key, { producto: key, ventas: 0, facturacion: 0 })
    const entry = map.get(key)
    entry.ventas += 1
    entry.facturacion += num(field(r, 'Monto de Venta'))
  }
  return Array.from(map.values())
    .map((e) => ({ ...e, ticket: e.ventas > 0 ? e.facturacion / e.ventas : 0 }))
    .sort((a, b) => b.facturacion - a.facturacion)
}

function computeDaily(ventas, metricas) {
  const spendByDate = new Map()
  for (const r of metricas) {
    const key = toDateKey(field(r, 'Day'))
    if (!key) continue
    spendByDate.set(key, (spendByDate.get(key) || 0) + num(field(r, 'Amount Spent')))
  }
  const revenueByDate = new Map()
  for (const r of ventas) {
    const key = toDateKey(field(r, 'Fecha de venta'))
    if (!key) continue
    revenueByDate.set(key, (revenueByDate.get(key) || 0) + num(field(r, 'Monto de Venta')))
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

export function computeDashboard(ventas, metricas, tally, fullTally = tally, excludedAdNames = []) {
  const inversion = sum(metricas, 'Amount Spent')
  const facturacion = sum(ventas, 'Monto de Venta')
  // No real per-lead data for this client (tally always empty) — fall back to the ad
  // platform's own "Tally Leads" count, skipping any ad explicitly flagged as non-lead-gen.
  const excluded = new Set(excludedAdNames.map((n) => clean(n)).filter(Boolean))
  const totalLeads =
    tally.length > 0
      ? tally.length
      : metricas
          .filter((r) => !excluded.has(clean(field(r, 'Ad Name'))))
          .reduce((acc, r) => acc + num(leadsResult(r)), 0)
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
    byAd: computeByAd(ventas, metricas, tally, fullTally, excludedAdNames),
    byZona: computeByZona(tally),
    byProducto: computeByProducto(ventas),
    daily: computeDaily(ventas, metricas),
  }
}
