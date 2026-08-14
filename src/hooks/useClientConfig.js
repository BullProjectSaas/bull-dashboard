import { useCallback, useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Public lookup (+ narrow write for excludedAdNames) of a single client's config doc by
// sheetId — used by the client-facing dashboard, which otherwise never touches Firestore.
// Missing doc (client not registered, or `clients` unreachable) just means no config
// overrides; the dashboard still works off the raw Sheet data either way. `clients` is
// already open read/write (see firestore.rules), same as the admin panel's client editing.
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

  const setExcludedAdNames = useCallback(
    (excludedAdNames) => setDoc(doc(db, 'clients', sheetId), { excludedAdNames }, { merge: true }),
    [sheetId],
  )

  return { config, ready, setExcludedAdNames }
}
