import { useState } from 'react'
import { C } from '../../theme'

export default function FinanceLoginGate({ signIn, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setChecking(true)
    await signIn(email, password)
    setChecking(false)
  }

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
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
            Finanzas
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Acceso solo para directivos de Bull Partners.</p>
        <input
          type="email"
          autoFocus
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            background: C.bg3,
            color: C.text,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 14,
          }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            background: C.bg3,
            color: C.text,
            border: `1px solid ${error ? C.red : C.border}`,
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 14,
          }}
        />
        {error && <span style={{ fontSize: 12, color: C.red }}>{error}</span>}
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
