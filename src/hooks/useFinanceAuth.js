import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../firebase'

// Real per-person login (Firebase Auth) gating the Finanzas area — separate from the shared
// admin/colaborador password, since this section holds real money data. Firestore security
// rules (see firestore.rules) are the actual enforcement; this hook just drives the UI.
export function useFinanceAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u)
    setLoading(false)
  }), [])

  const signIn = async (email, password) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      return true
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'Email o contraseña incorrectos.' : err.message)
      return false
    }
  }

  const signOutUser = () => signOut(auth)

  return { user, loading, error, signIn, signOutUser }
}
