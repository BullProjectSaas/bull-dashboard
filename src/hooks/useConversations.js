import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastMessageAt', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setConversations(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setReady(true)
      },
      (err) => {
        console.error('useConversations error', err)
        setError(err)
        setReady(true)
      },
    )
    return unsub
  }, [])

  return { conversations, ready, error }
}
