import { useState } from 'react'
import { C } from '../../theme'
import { useFinanceAuth } from '../../hooks/useFinanceAuth'
import { useFinanceSettings } from '../../hooks/useFinanceSettings'
import FinanceLoginGate from './FinanceLoginGate'
import FinanceDashboard from './FinanceDashboard'
import SettingsOverview from './SettingsOverview'
import MovementsPanel from './MovementsPanel'
import CollaboradoresPanel from './CollaboradoresPanel'
import ClientFinanceConfig from './ClientFinanceConfig'
import LiquidacionesPanel from './LiquidacionesPanel'

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'movimientos', label: 'Pagos e ingresos' },
  { key: 'colaboradores', label: 'Colaboradores' },
  { key: 'clientesFinanzas', label: 'Config. clientes' },
  { key: 'liquidaciones', label: 'Liquidaciones' },
  { key: 'configuracion', label: 'Configuración' },
]

function SeedBanner({ onSeed, error }) {
  const [seeding, setSeeding] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'rgba(245,158,11,0.1)',
        border: `1px solid ${C.amber}55`,
        borderRadius: 12,
        padding: '12px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: C.text }}>
          Todavía no se cargó la configuración fija (tramos, niveles, escalones de directivos, plantillas ISA).
        </span>
        <button
          onClick={async () => {
            setSeeding(true)
            await onSeed()
            setSeeding(false)
          }}
          disabled={seeding}
          style={{
            background: C.gold,
            color: C.bg,
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: seeding ? 'default' : 'pointer',
            opacity: seeding ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {seeding ? 'Cargando…' : 'Inicializar configuración'}
        </button>
      </div>
      {error && <span style={{ fontSize: 12, color: C.red }}>Error: {error}</span>}
    </div>
  )
}

export default function FinanceApp() {
  const { user, loading, error, signIn, signOutUser } = useFinanceAuth()
  const { settings, needsSeed, seedDefaults, error: settingsError } = useFinanceSettings(Boolean(user))
  const [tab, setTab] = useState('dashboard')

  if (loading) return <p style={{ fontSize: 13, color: C.muted, padding: 24 }}>Cargando…</p>
  if (!user) return <FinanceLoginGate signIn={signIn} error={error} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? C.gold : C.bg3,
                color: tab === t.key ? C.bg : C.muted,
                border: `1px solid ${tab === t.key ? C.gold : C.border}`,
                borderRadius: 999,
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: tab === t.key ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: C.muted }}>{user.email}</span>
          <button
            onClick={signOutUser}
            style={{ background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}
          >
            Salir de Finanzas
          </button>
        </div>
      </div>

      {needsSeed && <SeedBanner onSeed={seedDefaults} error={settingsError} />}

      {tab === 'dashboard' && <FinanceDashboard />}
      {tab === 'movimientos' && <MovementsPanel userEmail={user.email} />}
      {tab === 'colaboradores' && <CollaboradoresPanel />}
      {tab === 'clientesFinanzas' && <ClientFinanceConfig />}
      {tab === 'liquidaciones' && <LiquidacionesPanel settings={settings} userEmail={user.email} />}
      {tab === 'configuracion' && <SettingsOverview settings={settings} />}
    </div>
  )
}
