import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

const DEBOUNCE_MS = 600

// Syncs one campaign-structure board per Sheet ID via Firestore (boards/{sheetId}),
// so the whole team sees the same layout. Local state renders immediately; Firestore
// writes are debounced and best-effort — if the write fails (offline, rules, etc.) the
// board keeps working locally and just reports the error instead of breaking.
export function useBoard(sheetId) {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [ready, setReady] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const saveTimer = useRef(null)

  useEffect(() => {
    if (!sheetId) return undefined
    setReady(false)
    const ref = doc(db, 'boards', sheetId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data()
        setNodes(data?.nodes || [])
        setEdges(data?.edges || [])
        setReady(true)
        setSyncError(null)
      },
      (err) => {
        setSyncError(err.message)
        setNodes([])
        setEdges([])
        setReady(true)
      },
    )
    return () => {
      unsub()
      clearTimeout(saveTimer.current)
    }
  }, [sheetId])

  const persist = useCallback(
    (nextNodes, nextEdges) => {
      if (!sheetId) return
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const ref = doc(db, 'boards', sheetId)
        setDoc(ref, { nodes: nextNodes, edges: nextEdges, updatedAt: Date.now() }).catch((err) =>
          setSyncError(err.message),
        )
      }, DEBOUNCE_MS)
    },
    [sheetId],
  )

  return { nodes, setNodes, edges, setEdges, ready, syncError, persist }
}
