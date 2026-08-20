import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { C } from '../../theme'
import { fmtMoney } from '../../utils/financeFormat'

const tooltipStyle = {
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
}

const monthLabel = (key) => {
  const [y, m] = key.split('-')
  return `${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][Number(m) - 1]} ${y.slice(2)}`
}

// Trend view — last 12 months of activity, independent of the dashboard's date filter (same
// rationale as the cash flow chart: a trend needs its own fixed window, not a movable one).
export default function FinanceMonthlyBarChart({ transactions }) {
  const byMonth = new Map()
  for (const t of transactions) {
    const key = t.date.slice(0, 7)
    if (!byMonth.has(key)) byMonth.set(key, { month: key, ingresos: 0, egresos: 0 })
    const entry = byMonth.get(key)
    if (t.type === 'ingreso') entry.ingresos += t.amount
    else entry.egresos += t.amount
  }
  const data = Array.from(byMonth.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)
    .map((d) => ({ ...d, label: monthLabel(d.month) }))

  if (!data.length) {
    return <p style={{ color: C.muted, fontSize: 13 }}>Todavía no hay movimientos confirmados.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="label" stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} />
        <YAxis stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => fmtMoney(v)} width={90} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} labelStyle={{ color: C.gold, fontWeight: 700 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
        <Bar dataKey="ingresos" name="Ingresos" fill={C.green} radius={[3, 3, 0, 0]} />
        <Bar dataKey="egresos" name="Egresos" fill={C.red} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
