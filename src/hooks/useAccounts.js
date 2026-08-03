import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { ACCOUNTS } from '../utils/financeDefaults'

// Account balances are derived, not stored: the sum of every CONFIRMED transaction tagged to
// that account (ingreso adds, pago subtracts). Pendiente/cancelado transactions don't count
// yet — that's the point of the confirmation step. The `transactions` collection is empty
// until the ledger (pagos/ingresos) ships, so balances read as 0 until then.
export function useAccounts() {
  const [transactions, setTransactions] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'transactions'), where('status', '==', 'confirmado'))
    return onSnapshot(
      q,
      (snap) => {
        setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setReady(true)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setReady(true)
      },
    )
  }, [])

  const balances = ACCOUNTS.map((account) => {
    const balance = transactions
      .filter((t) => t.accountId === account.id)
      .reduce((sum, t) => sum + (t.type === 'ingreso' ? t.amount : -t.amount), 0)
    return { ...account, balance }
  })

  const total = balances.reduce((sum, a) => sum + a.balance, 0)

  return { balances, total, ready, error }
}
