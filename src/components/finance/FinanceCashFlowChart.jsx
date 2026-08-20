import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { C } from '../../theme'
import { fmtMoney } from '../../utils/financeFormat'
import { fmtDateShort } from '../../utils/metrics'

const tooltipStyle = {
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
}

// Running total across ALL confirmed transactions ever (not scoped to the dashboard's date
// filter) — a balance is inherently cumulative from day one, so filtering it by period would
// just show a chart that starts wrong.
export default function FinanceCashFlowChart({ transactions }) {
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date))
  const byDate = new Map()
  for (const t of sorted) {
    byDate.set(t.date, (byDate.get(t.date) || 0) + (t.type === 'ingreso' ? t.amount : -t.amount))
  }
  const dates = Array.from(byDate.keys()).sort()

  let acc = 0
  const data = dates.map((date) => {
    acc += byDate.get(date)
    return { date, saldo: acc }
  })

  if (!data.length) {
    return <p style={{ color: C.muted, fontSize: 13 }}>Todavía no hay movimientos confirmados.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.gold} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={fmtDateShort} />
        <YAxis stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => fmtMoney(v)} width={90} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmtMoney(v), 'Saldo']} labelFormatter={fmtDateShort} labelStyle={{ color: C.gold, fontWeight: 700 }} />
        <Area type="monotone" dataKey="saldo" stroke={C.gold} strokeWidth={2.5} fill="url(#saldoFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
