import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { C } from '../theme'
import { fmtARS } from '../utils/metrics'

const tooltipStyle = {
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
}

export default function SpendVsRevenueChart({ data }) {
  const chartData = data.filter((d) => d.gasto > 0 || d.facturacion > 0).slice(0, 12)

  if (!chartData.length) {
    return <p style={{ color: C.muted, fontSize: 13 }}>Sin datos suficientes para este gráfico.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
        <XAxis
          dataKey="ad"
          stroke={C.muted}
          tick={{ fontSize: 11, fill: C.muted }}
          angle={-30}
          textAnchor="end"
          interval={0}
          height={70}
        />
        <YAxis stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={fmtARS} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtARS(v)} labelStyle={{ color: C.gold, fontWeight: 700 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: C.muted }} />
        <Bar dataKey="gasto" name="Inversión" fill={C.muted} radius={[4, 4, 0, 0]} />
        <Bar dataKey="facturacion" name="Facturación" fill={C.gold} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
