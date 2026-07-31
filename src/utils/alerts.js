import { addDays, computeDashboard, field, toDateKey } from './metrics'

// Fallback when a client hasn't had a custom breakeven set yet.
export const DEFAULT_ROAS_BREAKEVEN = 2

// Window for the "ROAS bajo" alert — an all-time ROAS can hide a client that's
// struggling right now, so this looks at recent performance instead.
const ROAS_WINDOW_DAYS = 30

// "No hay data de ayer" = probable campaña pausada. Self-clearing by design: this is
// recomputed fresh from the live sheet on every load, nothing is persisted — the moment
// yesterday's metrics show up again, the alert stops firing on its own.
function lastMetricDay(metricas) {
  let max = null
  for (const r of metricas) {
    const k = toDateKey(field(r, 'Day'))
    if (k && (!max || k > max)) max = k
  }
  return max
}

export function computeClientAlerts(raw, roasBreakeven = DEFAULT_ROAS_BREAKEVEN) {
  const threshold = Number(roasBreakeven) > 0 ? Number(roasBreakeven) : DEFAULT_ROAS_BREAKEVEN
  const todayKey = toDateKey(new Date())
  const yesterdayKey = addDays(todayKey, -1)
  const windowStartKey = addDays(todayKey, -ROAS_WINDOW_DAYS)

  const lastDay = lastMetricDay(raw.metricas)
  const pausada = !lastDay || lastDay < yesterdayKey

  const ventasRecientes = raw.ventas.filter((r) => {
    const k = toDateKey(field(r, 'Fecha de venta'))
    return k && k >= windowStartKey
  })
  const metricasRecientes = raw.metricas.filter((r) => {
    const k = toDateKey(field(r, 'Day'))
    return k && k >= windowStartKey
  })
  const tallyRecientes = raw.tally.filter((r) => {
    const k = toDateKey(field(r, 'Fecha'))
    return k && k >= windowStartKey
  })
  const dash30d = computeDashboard(ventasRecientes, metricasRecientes, tallyRecientes)
  const roas30d = dash30d.scorecards.roas
  const roasBajo = dash30d.scorecards.inversion > 0 && roas30d < threshold

  return {
    pausada,
    lastDay,
    diasSinActividad: lastDay ? Math.round((new Date(todayKey) - new Date(lastDay)) / 86400000) : null,
    roasBajo,
    roas30d,
    roasBreakeven: threshold,
  }
}
