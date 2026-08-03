import { field, num, sum, toDateKey, getAttribution } from './metrics'

// Last 5 digits of a phone number, tolerant of country code / formatting differences.
// Mirrors the private helper in metrics.js (kept separate to avoid touching that file).
function phoneSuffix(v) {
  const digits = String(v ?? '').replace(/\D/g, '')
  return digits.length >= 5 ? digits.slice(-5) : null
}

// A sale is "recurrente" if that client's phone number shows up in another sale anywhere in
// the client's full sales history (not just this month) — literally what was asked for, no
// "first purchase is new" tax-bracket-style reasoning on top of it.
export function markRecurrence(allVentas) {
  const counts = new Map()
  for (const r of allVentas) {
    const suf = phoneSuffix(field(r, 'Celular Cliente'))
    if (suf) counts.set(suf, (counts.get(suf) || 0) + 1)
  }
  return allVentas.map((r) => {
    const suf = phoneSuffix(field(r, 'Celular Cliente'))
    return { ...r, _recurrente: suf ? (counts.get(suf) || 0) > 1 : false }
  })
}

export function filterByMonth(rows, dateField, monthKey) {
  return rows.filter((r) => (toDateKey(field(r, dateField)) || '').startsWith(monthKey))
}

// Progressive/marginal bracket calculation (like a tax table): each bracket only charges the
// portion of `base` that falls within it, not the whole base at that bracket's rate.
export function applyMarginalBrackets(base, brackets, getRate) {
  const sorted = [...(brackets || [])]
    .filter((b) => Number(b.max) > Number(b.min))
    .sort((a, b) => Number(a.min) - Number(b.min))

  const breakdown = []
  for (const b of sorted) {
    const lo = Number(b.min)
    const hi = Number(b.max)
    if (base <= lo) continue
    const portion = Math.min(base, hi) - lo
    if (portion <= 0) continue
    const rate = getRate(b)
    breakdown.push({ min: lo, max: hi, baseAplicada: portion, rate, monto: portion * rate })
  }

  return { subtotal: breakdown.reduce((acc, b) => acc + b.monto, 0), breakdown }
}

function ventaSummary(row, tally) {
  return {
    fecha: toDateKey(field(row, 'Fecha de venta')),
    nombre: field(row, 'Nombre del cliente') || '—',
    celular: field(row, 'Celular Cliente') || '—',
    adName: getAttribution(row, tally),
    monto: num(field(row, 'Monto de Venta')),
  }
}

// Full computation for one client + one month ("YYYY-MM"), given the client's own config,
// the fixed company-wide tables, and the raw sheet data (ventas/metricas/tally cover the
// client's *entire* history — recurrence needs the full history, not just this month).
export function computeLiquidacion({ client, month, ventasAll, metricasAll, tally, tramosEquipoBull, nivelesReparto }) {
  const ventasMarked = markRecurrence(ventasAll)
  const ventasMonth = filterByMonth(ventasMarked, 'Fecha de venta', month)
  const metricasMonth = filterByMonth(metricasAll || [], 'Day', month)
  const tallyMonth = filterByMonth(tally || [], 'Submitted at', month)

  const ventasNuevas = ventasMonth.filter((r) => !r._recurrente)
  const ventasRecurrentes = ventasMonth.filter((r) => r._recurrente)

  const facturacionNuevas = sum(ventasNuevas, 'Monto de Venta')
  const facturacionRecurrentes = sum(ventasRecurrentes, 'Monto de Venta')
  const facturacionTotal = facturacionNuevas + facturacionRecurrentes
  const inversionPub = sum(metricasMonth, 'Amount Spent')
  const roas = inversionPub > 0 ? facturacionTotal / inversionPub : 0

  const baseComisionable = Math.max(0, facturacionNuevas - inversionPub)

  const comisionNuevas = applyMarginalBrackets(baseComisionable, client.tramosComision, (b) => (Number(b.pct) || 0) / 100)

  const recurrenciaActiva = Boolean(client.recurrencia?.activo)
  const recurrenciaPct = (Number(client.recurrencia?.pct) || 0) / 100
  const comisionRecurrente = recurrenciaActiva ? facturacionRecurrentes * recurrenciaPct : 0

  const comisionTotal = comisionNuevas.subtotal + comisionRecurrente

  const equipoBull = applyMarginalBrackets(comisionTotal, tramosEquipoBull, (b) => Number(b.equipoPct) || 0)
  const fondoEquipo = equipoBull.subtotal
  const fondoBull = comisionTotal - fondoEquipo

  const nivelDef = client.nivelReparto ? nivelesReparto?.[client.nivelReparto] : null
  const roleSplits = nivelDef
    ? Object.entries(nivelDef.roles).map(([role, pct]) => ({ role, pct, monto: fondoEquipo * pct }))
    : []

  return {
    clientSheetId: client.sheetId,
    clientName: client.name,
    month,
    facturacionTotal,
    facturacionNuevas,
    facturacionRecurrentes,
    inversionPub,
    roas,
    leadsGenerados: tallyMonth.length,
    numVentas: ventasMonth.length,
    tasaCierre: tallyMonth.length > 0 ? (ventasMonth.length / tallyMonth.length) * 100 : 0,
    baseComisionable,
    ventasNuevas: ventasNuevas.map((r) => ventaSummary(r, tally)),
    ventasRecurrentes: ventasRecurrentes.map((r) => ventaSummary(r, tally)),
    comisionNuevas,
    recurrenciaActiva,
    recurrenciaPct,
    comisionRecurrente,
    comisionTotal,
    equipoBull,
    fondoEquipo,
    fondoBull,
    nivelReparto: client.nivelReparto || null,
    roleSplits,
  }
}
