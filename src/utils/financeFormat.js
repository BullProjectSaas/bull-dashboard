// Full-precision currency formatting for Finanzas — unlike fmtARS (dashboard charts), money
// here needs to show exact pesos, matching the "$ 27.219.999" style used in liquidation PDFs.
export const fmtMoney = (v, currency = 'ARS') => {
  const amount = Math.round(v || 0).toLocaleString('es-AR')
  return currency === 'USD' ? `US$ ${amount}` : `$ ${amount}`
}
