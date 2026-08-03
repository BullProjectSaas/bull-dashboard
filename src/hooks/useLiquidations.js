import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { ROLE_LABELS } from '../utils/financeDefaults'

export function useLiquidations() {
  const [liquidations, setLiquidations] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => onSnapshot(
    query(collection(db, 'liquidations'), orderBy('createdAt', 'desc')),
    (snap) => {
      setLiquidations(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setReady(true)
      setError(null)
    },
    (err) => {
      setError(err.message)
      setReady(true)
    },
  ), [])

  // Persists the liquidación and, in the same batch, creates the pending ledger movements it
  // implies: one ingreso for the full comisión (the client's payment coming in) and one pago
  // per collaborator actually assigned to a role — both start 'pendiente' until confirmed from
  // "Pagos e ingresos", same as any other movement.
  const saveLiquidacion = async (calc, roleAssignments, createdBy) => {
    const batch = writeBatch(db)
    const liqRef = doc(collection(db, 'liquidations'))

    batch.set(liqRef, {
      ...calc,
      roleAssignments,
      status: 'guardada',
      createdBy,
      createdAt: Date.now(),
    })

    if (calc.comisionTotal > 0) {
      const ingresoRef = doc(collection(db, 'transactions'))
      batch.set(ingresoRef, {
        type: 'ingreso',
        accountId: 'principal',
        category: 'Comisión mensual',
        amount: calc.comisionTotal,
        currency: 'ARS',
        date: `${calc.month}-01`,
        description: `${calc.clientName} — ${calc.month}`,
        status: 'pendiente',
        liquidationId: liqRef.id,
        createdBy,
        createdAt: Date.now(),
      })
    }

    for (const assignment of roleAssignments) {
      if (!assignment.collaboratorId || !(assignment.monto > 0)) continue
      const pagoRef = doc(collection(db, 'transactions'))
      batch.set(pagoRef, {
        type: 'pago',
        accountId: 'principal',
        category: `Reparto equipo — ${ROLE_LABELS[assignment.role] || assignment.role}`,
        amount: assignment.monto,
        currency: 'ARS',
        date: `${calc.month}-01`,
        description: `${assignment.collaboratorName} — ${calc.clientName} (${calc.month})`,
        status: 'pendiente',
        liquidationId: liqRef.id,
        createdBy,
        createdAt: Date.now(),
      })
    }

    await batch.commit()
    return liqRef.id
  }

  return { liquidations, ready, error, saveLiquidacion }
}
