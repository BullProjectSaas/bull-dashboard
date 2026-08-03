import { useCallback, useEffect, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

// Categories are created ad-hoc from the movement form (like "célula" in AddClientForm) —
// no fixed list, the team just types a new one the first time they need it.
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => onSnapshot(query(collection(db, 'categories'), orderBy('name')), (snap) => {
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setReady(true)
  }), [])

  const addCategory = useCallback(async (name, type) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const existing = categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.type === type)
    if (existing) return existing.id
    const ref = await addDoc(collection(db, 'categories'), { name: trimmed, type })
    return ref.id
  }, [categories])

  return { categories, ready, addCategory }
}
