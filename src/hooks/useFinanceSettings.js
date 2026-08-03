import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { DIRECTIVOS_TIERS, ISA_TEMPLATES, NIVELES_REPARTO, TRAMOS_EQUIPO_BULL } from '../utils/financeDefaults'

const DOC_ID = 'fixed'
const DOC_REF = doc(db, 'financeSettings', DOC_ID)

// The fixed, company-wide tables (tramos equipo/Bull, niveles de reparto, escalones de
// directivos, plantillas ISA). Seeded into Firestore on first use so they can be tweaked by a
// directivo later without a code deploy, instead of living only as constants in the bundle.
// `enabled` must stay false until Firebase Auth confirms a logged-in user — otherwise this
// subscribes before request.auth exists, Firestore denies it once, and (since onSnapshot
// doesn't retry on its own) the error sticks around even after login succeeds.
export function useFinanceSettings(enabled = true) {
  const [settings, setSettings] = useState(null)
  const [ready, setReady] = useState(!enabled)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled) return undefined
    return onSnapshot(
      DOC_REF,
      (snap) => {
        setSettings(snap.exists() ? snap.data() : null)
        setReady(true)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setReady(true)
      },
    )
  }, [enabled])

  const seedDefaults = useCallback(async () => {
    setError(null)
    try {
      const existing = await getDoc(DOC_REF)
      if (existing.exists()) return
      await setDoc(DOC_REF, {
        tramosEquipoBull: TRAMOS_EQUIPO_BULL,
        nivelesReparto: NIVELES_REPARTO,
        directivosTiers: DIRECTIVOS_TIERS,
        isaTemplates: ISA_TEMPLATES,
        seededAt: Date.now(),
      })
    } catch (err) {
      setError(err.message)
    }
  }, [])

  return { settings, ready, error, needsSeed: ready && !settings, seedDefaults }
}
