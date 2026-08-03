import { useCallback, useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { DIRECTIVOS_TIERS, ISA_TEMPLATES, NIVELES_REPARTO, TRAMOS_EQUIPO_BULL } from '../utils/financeDefaults'

const DOC_ID = 'fixed'
const DOC_REF = doc(db, 'financeSettings', DOC_ID)

// The fixed, company-wide tables (tramos equipo/Bull, niveles de reparto, escalones de
// directivos, plantillas ISA). Seeded into Firestore on first use so they can be tweaked by a
// directivo later without a code deploy, instead of living only as constants in the bundle.
export function useFinanceSettings() {
  const [settings, setSettings] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => onSnapshot(DOC_REF, (snap) => {
    setSettings(snap.exists() ? snap.data() : null)
    setReady(true)
  }), [])

  const seedDefaults = useCallback(async () => {
    const existing = await getDoc(DOC_REF)
    if (existing.exists()) return
    await setDoc(DOC_REF, {
      tramosEquipoBull: TRAMOS_EQUIPO_BULL,
      nivelesReparto: NIVELES_REPARTO,
      directivosTiers: DIRECTIVOS_TIERS,
      isaTemplates: ISA_TEMPLATES,
      seededAt: Date.now(),
    })
  }, [])

  return { settings, ready, needsSeed: ready && !settings, seedDefaults }
}
