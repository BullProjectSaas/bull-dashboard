import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { C } from '../theme'
import { fmtARS, fmtDateShort } from '../utils/metrics'

const tooltipStyle = {
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
}

export default function DailyEvolutionChart({ data }) {
  if (!data.length) {
    return <p style={{ color: C.muted, fontSize: 13 }}>Sin datos suficientes para este gráfico.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis dataKey="date" stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={fmtDateShort} />
        <YAxis stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={fmtARS} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => fmtARS(v)}
          labelFormatter={fmtDateShort}
          labelStyle={{ color: C.gold, fontWeight: 700 }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
        <Line type="monotone" dataKey="inversionAcum" name="Inversión acumulada" stroke={C.muted} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="facturacionAcum" name="Facturación acumulada" stroke={C.gold} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
