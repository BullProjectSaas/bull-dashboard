const RESPONSE_RE = /google\.visualization\.Query\.setResponse\(([\s\S]*?)\);?\s*$/

// gviz encodes date/datetime cells as the string "Date(y,m,d[,h,mi,s])" (month is 0-indexed)
function parseGvizValue(v) {
  if (typeof v === 'string' && v.startsWith('Date(') && v.endsWith(')')) {
    const parts = v.slice(5, -1).split(',').map(Number)
    const [y, m, d, h = 0, mi = 0, s = 0] = parts
    return new Date(y, m, d, h, mi, s)
  }
  return v
}

export async function fetchSheet(sheetId, sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`No se pudo leer la hoja "${sheetName}" (HTTP ${res.status}). Verificá que el Sheet ID sea correcto y que esté compartido públicamente.`)
  }
  const text = await res.text()
  const match = text.match(RESPONSE_RE)
  if (!match) {
    throw new Error(`Respuesta inesperada de Google Sheets para "${sheetName}". Verificá el Sheet ID.`)
  }

  let json
  try {
    json = JSON.parse(match[1])
  } catch {
    throw new Error(`No se pudo interpretar la respuesta de Google Sheets para "${sheetName}".`)
  }

  if (json.status === 'error') {
    const msg = json.errors?.[0]?.detailed_message || json.errors?.[0]?.message
    throw new Error(`Error en la hoja "${sheetName}": ${msg || 'no encontrada'}`)
  }

  const headers = json.table.cols.map((c) => c.label.trim())
  const rows = (json.table.rows || [])
    .filter((row) => row && row.c)
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, parseGvizValue(row.c[i]?.v ?? null)])))
    // Google Sheets pads the exported range with trailing empty-but-formatted rows;
    // drop rows that have no real value in any column so counts (ventas, leads) stay accurate.
    .filter((row) => Object.values(row).some((v) => v !== null && v !== undefined && String(v).trim() !== ''))

  return rows
}

export async function fetchAllSheets(sheetId) {
  const [ventas, metricas, tally] = await Promise.all([
    fetchSheet(sheetId, '01 - Data Ventas Form'),
    fetchSheet(sheetId, '02 - Métricas Anuncios'),
    fetchSheet(sheetId, '03 - Tally leads'),
  ])
  return { ventas, metricas, tally }
}
