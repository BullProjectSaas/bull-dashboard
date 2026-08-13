import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

// Public, read-only lookup of a single client's config doc (célula/etiqueta/excludedAdNames/
// etc.) by sheetId — used by the client-facing dashboard, which otherwise never touches
// Firestore. Missing doc (client not registered, or `clients` unreachable) just means no
// config overrides; the dashboard still works off the raw Sheet data either way.
export function useClientConfig(sheetId) {
  const [config, setConfig] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!sheetId) return undefined
    setReady(false)
    return onSnapshot(
      doc(db, 'clients', sheetId),
      (snap) => {
        setConfig(snap.exists() ? snap.data() : null)
        setReady(true)
      },
      () => {
        setConfig(null)
        setReady(true)
      },
    )
  }, [sheetId])

  return { config, ready }
}
