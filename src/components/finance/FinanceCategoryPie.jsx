import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { C } from '../../theme'
import { fmtMoney } from '../../utils/financeFormat'
import { CATEGORY_COLORS, OTHER_COLOR, foldToPalette } from '../../utils/financePalette'

const tooltipStyle = {
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 13,
}

const th = { textAlign: 'left', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, padding: '5px 8px', borderBottom: `1px solid ${C.border}` }
const td = { fontSize: 12, color: C.text, padding: '5px 8px', borderBottom: `1px solid ${C.border}` }

export default function FinanceCategoryPie({ transactions }) {
  const byCategory = new Map()
  for (const t of transactions) {
    const key = t.category || 'Sin categoría'
    byCategory.set(key, (byCategory.get(key) || 0) + t.amount)
  }
  const raw = Array.from(byCategory.entries()).map(([category, amount]) => ({ category, amount }))
  const data = foldToPalette(raw, 'category', 'amount')
  const total = data.reduce((acc, d) => acc + d.amount, 0)

  if (!data.length) {
    return <p style={{ color: C.muted, fontSize: 13 }}>Sin movimientos confirmados en este período.</p>
  }

  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ flex: '1 1 220px', minWidth: 220 }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {data.map((d, i) => (
                <Cell key={d.category} fill={d.category === 'Otros' ? OTHER_COLOR : CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke={C.bg2} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmtMoney(v), n]} />
            <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: '1 1 220px', minWidth: 220, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={th}>Categoría</th><th style={{ ...th, textAlign: 'right' }}>Monto</th><th style={{ ...th, textAlign: 'right' }}>%</th></tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={d.category}>
                <td style={td}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: d.category === 'Otros' ? OTHER_COLOR : CATEGORY_COLORS[i % CATEGORY_COLORS.length], marginRight: 6 }} />
                  {d.category}
                </td>
                <td style={{ ...td, textAlign: 'right' }}>{fmtMoney(d.amount)}</td>
                <td style={{ ...td, textAlign: 'right', color: C.muted }}>{total > 0 ? `${((d.amount / total) * 100).toFixed(0)}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
