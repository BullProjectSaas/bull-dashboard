import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { C } from '../theme'
import { fmtROAS, roasColor } from '../utils/metrics'

const tooltipStyle = {
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
}

export default function RoasByAdChart({ data }) {
  const chartData = data.filter((d) => d.gasto > 0).slice(0, 12)

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
        <YAxis stroke={C.muted} tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => `${v.toFixed(0)}x`} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [fmtROAS(v), 'ROAS']}
          labelStyle={{ color: C.gold, fontWeight: 700 }}
        />
        <Bar dataKey="roas" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.ad} fill={roasColor(entry.roas)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
