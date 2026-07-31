import { useState } from 'react'
import { C } from './theme'
import { isUnlocked, lock } from './utils/auth'
import { useClients } from './hooks/useClients'
import PasswordGate from './components/admin/PasswordGate'
import ClientManager from './components/admin/ClientManager'
import AggregateOverview from './components/admin/AggregateOverview'

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'clientes', label: 'Clientes' },
]

export default function AdminApp() {
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [tab, setTab] = useState('resumen')
  const { clients, ready, error, addClient, removeClient } = useClients()

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  return (
    <div style={{ minHeight: '100vh', color: C.text }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 24px',
          background: 'rgba(19,30,49,0.9)',
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="" width={30} height={25} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: 1.2, color: C.text, textTransform: 'uppercase', lineHeight: 1 }}>
              Panel interno
            </h1>
            <span style={{ fontSize: 11, color: C.muted, opacity: 0.7 }}>Bull Partners™</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href={import.meta.env.BASE_URL} style={{ fontSize: 12, color: C.muted, textDecoration: 'none' }}>
            Ir al dashboard →
          </a>
          <button
            onClick={() => {
              lock()
              setUnlocked(false)
            }}
            style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}
          >
            Salir
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, padding: '16px 24px', background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? C.gold : C.bg3,
              color: tab === t.key ? C.bg : C.muted,
              border: `1px solid ${tab === t.key ? C.gold : C.border}`,
              borderRadius: 999,
              padding: '7px 18px',
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {t.label}
            {t.key === 'clientes' && ready ? ` (${clients.length})` : ''}
          </button>
        ))}
      </div>

      <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {tab === 'clientes' ? (
          <ClientManager clients={clients} ready={ready} error={error} addClient={addClient} removeClient={removeClient} />
        ) : (
          <AggregateOverview clients={clients} />
        )}
      </main>
    </div>
  )
}
