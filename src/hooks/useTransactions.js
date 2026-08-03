import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Pagos e ingresos ledger. Every movement starts 'pendiente' and only counts towards an
// account's balance (see useAccounts) once it's 'confirmado' — 'cancelado' means the team
// decided it doesn't happen (money stays put, e.g. a directivo leaving their cut invested).
export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => onSnapshot(
    query(collection(db, 'transactions'), orderBy('date', 'desc')),
    (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setReady(true)
      setError(null)
    },
    (err) => {
      setError(err.message)
      setReady(true)
    },
  ), [])

  const addTransaction = useCallback(async (data) => {
    await addDoc(collection(db, 'transactions'), {
      ...data,
      status: 'pendiente',
      createdAt: Date.now(),
    })
  }, [])

  const setStatus = useCallback(async (id, status) => {
    await updateDoc(doc(db, 'transactions', id), { status, statusChangedAt: Date.now() })
  }, [])

  return { transactions, ready, error, addTransaction, setStatus }
}
