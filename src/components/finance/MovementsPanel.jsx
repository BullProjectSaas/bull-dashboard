import Section from '../Section'
import { useTransactions } from '../../hooks/useTransactions'
import TransactionForm from './TransactionForm'
import TransactionsList from './TransactionsList'

export default function MovementsPanel({ userEmail }) {
  const { transactions, ready, error, addTransaction, setStatus } = useTransactions()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Section title="Registrar pago o ingreso">
        <TransactionForm addTransaction={addTransaction} userEmail={userEmail} />
      </Section>

      <Section title="Movimientos">
        <TransactionsList transactions={transactions} ready={ready} error={error} setStatus={setStatus} />
      </Section>
    </div>
  )
}
