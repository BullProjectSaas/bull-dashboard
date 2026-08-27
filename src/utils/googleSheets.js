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

// Tolerant header lookup (accents/casing/whitespace/underscores), mirrors utils/metrics.js' field()
function normKey(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function pick(row, name) {
  if (name in row) return row[name]
  const target = normKey(name)
  for (const key of Object.keys(row)) {
    if (normKey(key) === target) return row[key]
  }
  return null
}

const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== ''

// Google Sheets pads the exported range with trailing rows. A generic "any column is
// non-empty" check isn't reliable because a stray formula/autofill in some unrelated
// column can leave a truthy value on every padded row too. Instead, require the field(s)
// that only exist on a genuine record (a real sale, a real ad-metrics day, a real
// submission) to be filled.
const REQUIRED_FIELDS = {
  '01 - Data Ventas Form': ['Fecha de venta', 'Monto de Venta'],
  '02 - Métricas Anuncios': ['Day', 'Ad Name'],
  '03 - Tally leads': ['Submitted at'],
  '04 - Tally leads org': ['Submitted at'],
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
  const requiredFields = REQUIRED_FIELDS[sheetName]
  const rows = (json.table.rows || [])
    .filter((row) => row && row.c)
    .map((row) => Object.fromEntries(headers.map((h, i) => [h, parseGvizValue(row.c[i]?.v ?? null)])))
    .filter((row) =>
      requiredFields
        ? requiredFields.every((f) => hasValue(pick(row, f)))
        : Object.values(row).some(hasValue),
    )

  return rows
}

// "04 - Tally leads org" is an optional second leads form (organic, non-paid traffic) some
// clients add alongside the regular one — most clients don't have it. Treat a missing sheet
// as "no organic leads yet" instead of failing the whole dashboard over an optional tab.
async function fetchSheetOptional(sheetId, sheetName) {
  try {
    return await fetchSheet(sheetId, sheetName)
  } catch {
    return []
  }
}

export async function fetchAllSheets(sheetId) {
  const [ventas, metricas, tally, tallyOrg] = await Promise.all([
    fetchSheet(sheetId, '01 - Data Ventas Form'),
    fetchSheet(sheetId, '02 - Métricas Anuncios'),
    fetchSheet(sheetId, '03 - Tally leads'),
    fetchSheetOptional(sheetId, '04 - Tally leads org'),
  ])
  return { ventas, metricas, tally: [...tally, ...tallyOrg] }
}
