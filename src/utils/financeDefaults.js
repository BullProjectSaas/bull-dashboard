// Fixed company-wide finance config, sourced from "Estructura financiera - bull interno".
// These are seeded into Firestore (`financeSettings` collection) the first time a directivo
// opens the Finanzas area, and can be edited from there afterwards without a redeploy.

// Split between the team's fund and Bull's fund, based on the commission amount charged to
// the client that period.
export const TRAMOS_EQUIPO_BULL = [
  { min: 0, max: 1_000_000, equipoPct: 0.7, bullPct: 0.3 },
  { min: 1_000_000, max: 2_000_000, equipoPct: 0.65, bullPct: 0.35 },
  { min: 2_000_000, max: 4_000_000, equipoPct: 0.6, bullPct: 0.4 },
  { min: 4_000_000, max: 8_000_000, equipoPct: 0.5, bullPct: 0.5 },
]

// How a client's team fund splits across roles, depending on the "nivel" assigned to that
// client (set per client, not per célula — a célula can mix clients with/without a CM).
export const NIVELES_REPARTO = {
  nivel1: { label: 'Nivel 1 (Trafficker y PM en 1)', roles: { trafficker: 0.6, creativo: 0.4 } },
  nivel2: { label: 'Nivel 2 (3 clientes o más)', roles: { pm: 0.3, trafficker: 0.35, creativo: 0.35 } },
  conCM: { label: 'Con CM', roles: { pm: 0.3, trafficker: 0.3, creativo: 0.3, cm: 0.1 } },
}

export const NIVEL_OPTIONS = Object.entries(NIVELES_REPARTO).map(([value, { label }]) => ({ value, label }))

// Monthly distribution of the aggregate "Fondo de Bull" (the sum of every client commission
// liquidation's Bull share for the period — does NOT include one-off ISA income) across the
// two reserve accounts and the two directivos' payouts. Whichever tier the total fondo falls
// under, that tier's percentages apply to the whole amount (not a marginal/bracket split).
export const DIRECTIVOS_TIERS = [
  { max: 2_000_000, reservaInversionPct: 0.35, reservaOperativaPct: 0.15, cooPct: 0.25, ceoPct: 0.25 },
  { max: 4_000_000, reservaInversionPct: 0.2, reservaOperativaPct: 0.1, cooPct: 0.3, ceoPct: 0.3 },
  { max: 8_000_000, reservaInversionPct: 0.25, reservaOperativaPct: 0.15, cooPct: 0.3, ceoPct: 0.3 },
  { max: 16_000_000, reservaInversionPct: 0.25, reservaOperativaPct: 0.35, cooPct: 0.2, ceoPct: 0.2 },
  { max: 32_000_000, reservaInversionPct: 0.2, reservaOperativaPct: 0.4, cooPct: 0.1, ceoPct: 0.1 },
  { max: 64_000_000, reservaInversionPct: 0.15, reservaOperativaPct: 0.45, cooPct: 0.05, ceoPct: 0.05 },
  { max: 128_000_000, reservaInversionPct: 0.1, reservaOperativaPct: 0.5, cooPct: 0.05, ceoPct: 0.05 },
]

// Flat one-time onboarding fee a new client pays to join Bull. Split in fixed amounts (USD),
// not percentages.
export const ISA_TEMPLATES = [
  {
    key: 'isa_450',
    label: 'ISA — $450 USD',
    amountUSD: 450,
    splits: { pm: 100, trafficker: 100, creativo: 100, fondoBull: 150 },
  },
  {
    key: 'isa_1000',
    label: 'ISA con ODP — $1.000 USD',
    amountUSD: 1000,
    splits: { pm: 200, trafficker: 200, creativo: 200, fondoBull: 400 },
  },
]

export const ACCOUNTS = [
  { id: 'principal', name: 'Principal' },
  { id: 'reserva_operativa', name: 'Reserva Operativa' },
  { id: 'reserva_inversion', name: 'Reserva de Inversión' },
]

export const ROLE_LABELS = {
  pm: 'PM',
  trafficker: 'Trafficker',
  creativo: 'Creativo',
  cm: 'CM',
}
