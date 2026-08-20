import { useMemo, useState } from 'react'
import { C } from '../../theme'
import Section from '../Section'
import ScoreCard from '../ScoreCard'
import CompactDateFilter from '../admin/CompactDateFilter'
import { useTransactions } from '../../hooks/useTransactions'
import { fmtMoney } from '../../utils/financeFormat'
import AccountsOverview from './AccountsOverview'
import FinanceCategoryPie from './FinanceCategoryPie'
import FinanceCashFlowChart from './FinanceCashFlowChart'
import FinanceMonthlyBarChart from './FinanceMonthlyBarChart'

const inRange = (date, from, to) => (!from || date >= from) && (!to || date <= to)

export default function FinanceDashboard() {
  const [range, setRange] = useState({ from: '', to: '' })
  const { transactions, ready, error } = useTransactions()

  const confirmed = useMemo(() => transactions.filter((t) => t.status === 'confirmado'), [transactions])
  const pendientes = useMemo(() => transactions.filter((t) => t.status === 'pendiente'), [transactions])

  const periodConfirmed = useMemo(
    () => confirmed.filter((t) => inRange(t.date, range.from, range.to)),
    [confirmed, range],
  )
  const periodIngresos = useMemo(() => periodConfirmed.filter((t) => t.type === 'ingreso'), [periodConfirmed])
  const periodEgresos = useMemo(() => periodConfirmed.filter((t) => t.type === 'pago'), [periodConfirmed])

  const totalIngresos = periodIngresos.reduce((acc, t) => acc + t.amount, 0)
  const totalEgresos = periodEgresos.reduce((acc, t) => acc + t.amount, 0)
  const balanceNeto = totalIngresos - totalEgresos
  const totalPendiente = pendientes.reduce((acc, t) => acc + t.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CompactDateFilter range={range} onChange={setRange} />
      </div>

      <AccountsOverview />

      {error && <p style={{ fontSize: 12, color: C.red, margin: 0 }}>No se pudo sincronizar con Firebase ({error}).</p>}

      {!ready ? (
        <p style={{ fontSize: 13, color: C.muted }}>Cargando movimientos…</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <ScoreCard label="Ingresos del período" value={fmtMoney(totalIngresos)} color={C.green} />
            <ScoreCard label="Egresos del período" value={fmtMoney(totalEgresos)} color={C.red} />
            <ScoreCard label="Balance neto" value={fmtMoney(balanceNeto)} color={balanceNeto >= 0 ? C.gold : C.red} />
            <ScoreCard label="Pendiente por confirmar" value={fmtMoney(totalPendiente)} sub={`${pendientes.length} movimiento(s)`} color={C.amber} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: 20,
            }}
          >
            <Section title="Ingresos por categoría">
              <FinanceCategoryPie transactions={periodIngresos} />
            </Section>
            <Section title="Gastos por categoría">
              <FinanceCategoryPie transactions={periodEgresos} />
            </Section>
          </div>

          <Section title="Evolución del saldo total (histórico)">
            <FinanceCashFlowChart transactions={confirmed} />
          </Section>

          <Section title="Ingresos vs egresos por mes (últimos 12 meses)">
            <FinanceMonthlyBarChart transactions={confirmed} />
          </Section>
        </>
      )}
    </div>
  )
}
