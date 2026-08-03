import { useMemo, useState } from 'react'
import { C } from '../../theme'
import { ACCOUNTS } from '../../utils/financeDefaults'
import { fmtMoney } from '../../utils/financeFormat'

const STATUS_FILTERS = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'cancelado', label: 'Cancelados' },
  { key: 'todos', label: 'Todos' },
]

const STATUS_COLOR = { pendiente: C.amber, confirmado: C.green, cancelado: C.muted }
const ACCOUNT_NAME = Object.fromEntries(ACCOUNTS.map((a) => [a.id, a.name]))

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status]
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderRadius: 999,
        padding: '3px 9px',
        whiteSpace: 'nowrap',
        textTransform: 'capitalize',
      }}
    >
      {status}
    </span>
  )
}

function Row({ tx, setStatus }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <span style={{ fontSize: 12, color: C.muted, width: 82 }}>{tx.date}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: tx.type === 'ingreso' ? C.green : C.red,
          width: 62,
        }}
      >
        {tx.type === 'ingreso' ? 'Ingreso' : 'Pago'}
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, flex: '1 1 160px' }}>{tx.category}</span>
      <span style={{ fontSize: 12, color: C.muted, flex: '1 1 160px' }}>{tx.description || '—'}</span>
      <span style={{ fontSize: 12, color: C.muted, width: 130 }}>{ACCOUNT_NAME[tx.accountId] || tx.accountId}</span>
      <span style={{ fontSize: 14, fontWeight: 800, width: 130, textAlign: 'right', color: tx.type === 'ingreso' ? C.green : C.red }}>
        {tx.type === 'ingreso' ? '+' : '−'}{fmtMoney(tx.amount)}
      </span>
      <StatusBadge status={tx.status} />
      {tx.status === 'pendiente' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setStatus(tx.id, 'confirmado')}
            style={{ background: C.green, color: C.bg, border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            Confirmar
          </button>
          <button
            onClick={() => setStatus(tx.id, 'cancelado')}
            style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

export default function TransactionsList({ transactions, ready, error, setStatus }) {
  const [filter, setFilter] = useState('pendiente')

  const filtered = useMemo(
    () => (filter === 'todos' ? transactions : transactions.filter((t) => t.status === filter)),
    [transactions, filter],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              background: filter === f.key ? C.gold : C.bg3,
              color: filter === f.key ? C.bg : C.muted,
              border: `1px solid ${filter === f.key ? C.gold : C.border}`,
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: filter === f.key ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {f.label}
            {f.key !== 'todos' && ` (${transactions.filter((t) => t.status === f.key).length})`}
          </button>
        ))}
      </div>

      {error && <p style={{ fontSize: 12, color: C.red, margin: 0 }}>No se pudo sincronizar con Firebase ({error}).</p>}
      {!ready ? (
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Cargando movimientos…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((tx) => (
            <Row key={tx.id} tx={tx} setStatus={setStatus} />
          ))}
          {!filtered.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>No hay movimientos acá.</p>}
        </div>
      )}
    </div>
  )
}
