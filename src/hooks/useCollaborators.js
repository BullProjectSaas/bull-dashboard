import { useCallback, useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

// Roster of people who can be assigned a % in a liquidación (PM, Trafficker, Creativo, CM).
// Created inline from the liquidación flow or managed here.
export function useCollaborators() {
  const [collaborators, setCollaborators] = useState([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => onSnapshot(
    collection(db, 'collaborators'),
    (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      setCollaborators(list)
      setReady(true)
      setError(null)
    },
    (err) => {
      setError(err.message)
      setReady(true)
    },
  ), [])

  const addCollaborator = useCallback(async (name, role) => {
    const ref = doc(collection(db, 'collaborators'))
    await setDoc(ref, { name: name.trim(), role, active: true, createdAt: Date.now() })
    return ref.id
  }, [])

  const updateCollaborator = useCallback(async (id, patch) => {
    await updateDoc(doc(db, 'collaborators', id), patch)
  }, [])

  const removeCollaborator = useCallback(async (id) => {
    await deleteDoc(doc(db, 'collaborators', id))
  }, [])

  return { collaborators, ready, error, addCollaborator, updateCollaborator, removeCollaborator }
}
