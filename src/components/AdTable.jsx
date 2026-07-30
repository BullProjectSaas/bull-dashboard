import { C } from '../theme'
import { fmtARS, fmtInt, fmtPct, fmtROAS, roasColor } from '../utils/metrics'

const th = {
  textAlign: 'right',
  padding: '10px 14px',
  fontSize: 11,
  color: C.muted,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
}
const td = {
  padding: '10px 14px',
  fontSize: 13,
  color: C.text,
  borderBottom: `1px solid ${C.border}`,
  textAlign: 'right',
  whiteSpace: 'nowrap',
}

export default function AdTable({ data }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: 'left' }}>Anuncio</th>
            <th style={th}>Inversión</th>
            <th style={th}>Facturación</th>
            <th style={th}>ROAS</th>
            <th style={th}>Leads</th>
            <th style={th}>Ventas</th>
            <th style={th}>Tasa Cierre</th>
            <th style={th}>CPL</th>
            <th style={th}>Costo/Venta</th>
            <th style={th}>Ticket</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.ad}>
              <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{row.ad}</td>
              <td style={td}>{fmtARS(row.gasto)}</td>
              <td style={td}>{fmtARS(row.facturacion)}</td>
              <td style={{ ...td, color: roasColor(row.roas), fontWeight: 700 }}>{fmtROAS(row.roas)}</td>
              <td style={td}>{fmtInt(row.leadsCount)}</td>
              <td style={td}>{fmtInt(row.ventasCount)}</td>
              <td style={td}>{fmtPct(row.tasaCierre)}</td>
              <td style={td}>{fmtARS(row.cpl)}</td>
              <td style={td}>{fmtARS(row.costoPorVenta)}</td>
              <td style={td}>{fmtARS(row.ticket)}</td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td style={{ ...td, textAlign: 'center' }} colSpan={10}>
                Sin datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
