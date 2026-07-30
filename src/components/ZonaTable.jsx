import { C } from '../theme'
import { fmtInt, fmtPct } from '../utils/metrics'

const th = {
  textAlign: 'right',
  padding: '10px 14px',
  fontSize: 11,
  color: C.muted,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  borderBottom: `1px solid ${C.border}`,
}
const td = {
  padding: '10px 14px',
  fontSize: 13,
  color: C.text,
  borderBottom: `1px solid ${C.border}`,
  textAlign: 'right',
}

export default function ZonaTable({ data }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left' }}>Zona</th>
            <th style={th}>Leads</th>
            <th style={th}>% Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.zona}>
              <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{row.zona}</td>
              <td style={td}>{fmtInt(row.leads)}</td>
              <td style={td}>{fmtPct(row.pct)}</td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={3}>
                Sin datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
