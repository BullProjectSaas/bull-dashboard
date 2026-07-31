import { useState } from 'react'
import { C } from '../../theme'
import { checkPassword, unlock } from '../../utils/auth'

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setChecking(true)
    const ok = await checkPassword(value)
    setChecking(false)
    if (ok) {
      unlock()
      onUnlock()
    } else {
      setError(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form
        onSubmit={submit}
        style={{
          background: C.bg2,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: '32px 28px',
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '0 12px 28px -12px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="" width={26} height={22} />
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: 1 }}>
            Panel interno
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Acceso solo para el equipo de Bull Partners.</p>
        <input
          type="password"
          autoFocus
          placeholder="Contraseña"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          style={{
            background: C.bg3,
            color: C.text,
            border: `1px solid ${error ? C.red : C.border}`,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 14,
          }}
        />
        {error && <span style={{ fontSize: 12, color: C.red }}>Contraseña incorrecta.</span>}
        <button
          type="submit"
          disabled={checking}
          style={{
            background: C.gold,
            color: C.bg,
            border: 'none',
            borderRadius: 10,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: 14,
            cursor: checking ? 'default' : 'pointer',
            opacity: checking ? 0.7 : 1,
          }}
        >
          {checking ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
