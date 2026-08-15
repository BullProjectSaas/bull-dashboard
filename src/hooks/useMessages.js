import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export function useMessages(waId) {
  const [messages, setMessages] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!waId) {
      setMessages([])
      setReady(true)
      return undefined
    }
    setReady(false)
    const q = query(collection(db, 'conversations', waId, 'messages'), orderBy('timestamp', 'asc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setReady(true)
      },
      (err) => {
        console.error('useMessages error', err)
        setReady(true)
      },
    )
    return unsub
  }, [waId])

  return { messages, ready }
}
