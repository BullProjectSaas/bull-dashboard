import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase'

// Manual changelog of business/campaign events per client (budget bump, salesperson change,
// new creative, etc.) — same open read/write as `clients`/`boards`, no login. Lives in its
// own top-level collection (not nested under the client doc) since it's a growing list, not
// a single config blob.
export function useActivities(sheetId) {
  const [activities, setActivities] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sheetId) return undefined
    const q = query(collection(db, 'activities'), where('sheetId', '==', sheetId), orderBy('date', 'desc'))
    return onSnapshot(
      q,
      (snap) => {
        setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setReady(true)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setReady(true)
      },
    )
  }, [sheetId])

  const addActivity = useCallback(
    async (date, category, description) => {
      const ref = doc(collection(db, 'activities'))
      await setDoc(ref, { sheetId, date, category, description: description.trim(), createdAt: Date.now() })
    },
    [sheetId],
  )

  const removeActivity = useCallback((id) => deleteDoc(doc(db, 'activities', id)), [])

  return { activities, ready, error, addActivity, removeActivity }
}
