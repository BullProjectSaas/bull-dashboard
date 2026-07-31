import { C } from '../theme'
import { fmtARS, fmtInt } from '../utils/metrics'

const th = {
  textAlign: 'right',
  padding: '10px 14px',
  fontSize: 11,
  color: C.muted,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  borderBottom: `1px solid ${C.border}`,
  position: 'sticky',
  top: 0,
  background: C.bg2,
}
const td = {
  padding: '10px 14px',
  fontSize: 13,
  color: C.text,
  borderBottom: `1px solid ${C.border}`,
  textAlign: 'right',
}

export default function ProductoTable({ data }) {
  return (
    <div style={{ overflow: 'auto', maxHeight: 420 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left' }}>Producto</th>
            <th style={th}>Ventas</th>
            <th style={th}>Facturación</th>
            <th style={th}>Ticket</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.producto}>
              <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{row.producto}</td>
              <td style={td}>{fmtInt(row.ventas)}</td>
              <td style={td}>{fmtARS(row.facturacion)}</td>
              <td style={td}>{fmtARS(row.ticket)}</td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={4}>
                Sin datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
