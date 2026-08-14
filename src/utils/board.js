import { field, clean } from './metrics'

export const STATUS = {
  PRODUCCION: 'produccion',
  SEMIVALIDADO: 'semivalidado',
  ROAS_POSITIVO: 'roas_positivo',
  ROAS_ALTO: 'roas_alto',
  ROAS_NEGATIVO: 'roas_negativo',
}

export const STATUS_META = {
  [STATUS.PRODUCCION]: { label: 'En producción (sin leads/ventas todavía)', color: '#E8EDF2', text: '#0F1923' },
  [STATUS.SEMIVALIDADO]: { label: 'Semivalidado (genera leads, sin ventas)', color: '#F2C94C', text: '#0F1923' },
  [STATUS.ROAS_POSITIVO]: { label: 'ROAS > 1', color: '#7BD98A', text: '#0F1923' },
  [STATUS.ROAS_ALTO]: { label: 'ROAS > 5', color: '#22C55E', text: '#08150C' },
  [STATUS.ROAS_NEGATIVO]: { label: 'ROAS < 1', color: '#EF4444', text: '#2A0808' },
}

// Auto-status for a data-linked ad node, from the same byAd aggregate used everywhere
// else in the dashboard — this is what makes the block's color update on its own as new
// data comes in, no manual re-coloring needed.
export function adStatus(adData) {
  if (!adData) return STATUS.PRODUCCION
  const { leadsCount, ventasCount, roas } = adData
  if (ventasCount > 0) {
    if (roas > 5) return STATUS.ROAS_ALTO
    if (roas > 1) return STATUS.ROAS_POSITIVO
    return STATUS.ROAS_NEGATIVO
  }
  if (leadsCount > 0) return STATUS.SEMIVALIDADO
  return STATUS.PRODUCCION
}

// Ads already known from live data (spend, leads and/or sales) that aren't placed on the
// board yet — the palette the team drags/clicks into the canvas.
export function getAvailableAds(byAd, placedAdNames) {
  return byAd.filter((a) => a.ad !== 'Sin atribución' && !placedAdNames.has(a.ad))
}

// Campaign/adset names known from Tally's UTM columns and/or the ad metrics sheet's own
// "Campaign Name"/"Ad Set Name" columns, for the structural (non-ad) palette blocks — these
// don't carry spend data themselves. Metrics is the only source for clients with no Tally
// data at all (see computeDashboard's "Tally Leads" fallback).
export function getKnownGroups(tally, metricas = []) {
  const campaigns = new Set()
  const adsets = new Set()
  for (const r of tally) {
    const camp = clean(field(r, 'utm_campaign'))
    const adset = clean(field(r, 'utm_adset'))
    if (camp) campaigns.add(camp)
    if (adset) adsets.add(adset)
  }
  for (const r of metricas) {
    const camp = clean(field(r, 'Campaign Name'))
    const adset = clean(field(r, 'Ad Set Name'))
    if (camp) campaigns.add(camp)
    if (adset) adsets.add(adset)
  }
  return { campaigns: Array.from(campaigns).sort(), adsets: Array.from(adsets).sort() }
}
