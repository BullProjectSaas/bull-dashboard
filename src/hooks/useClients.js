import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Client registry, shared across the whole team: collection `clients`, one doc per Sheet
// ID (using the Sheet ID itself as the doc id — adding the same sheet twice just upserts
// the name instead of creating a duplicate entry).
export function useClients() {
  const [clients, setClients] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'clients'),
      (snap) => {
        const list = snap.docs.map((d) => ({ sheetId: d.id, ...d.data() }))
        list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        setClients(list)
        setReady(true)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setReady(true)
      },
    )
    return () => unsub()
  }, [])

  const addClient = useCallback(async (name, sheetId, celula, etiqueta) => {
    await setDoc(doc(db, 'clients', sheetId.trim()), {
      name: name.trim(),
      celula: (celula || '').trim(),
      etiqueta: etiqueta || '',
      addedAt: Date.now(),
    })
  }, [])

  const updateClient = useCallback(async (sheetId, patch) => {
    await setDoc(doc(db, 'clients', sheetId), patch, { merge: true })
  }, [])

  const removeClient = useCallback(async (sheetId) => {
    await deleteDoc(doc(db, 'clients', sheetId))
  }, [])

  return { clients, ready, error, addClient, updateClient, removeClient }
}
