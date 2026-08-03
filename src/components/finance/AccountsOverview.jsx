import { C } from '../../theme'
import Section from '../Section'
import { useAccounts } from '../../hooks/useAccounts'
import { fmtMoney } from '../../utils/financeFormat'

function AccountCard({ name, balance }) {
  return (
    <div
      style={{
        flex: '1 1 200px',
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '16px 18px',
      }}
    >
      <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{name}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{fmtMoney(balance)}</div>
    </div>
  )
}

export default function AccountsOverview() {
  const { balances, total, ready, error } = useAccounts()

  return (
    <Section title="Cuentas de Bull">
      {error && <p style={{ fontSize: 12, color: C.red, marginTop: 0 }}>No se pudo sincronizar con Firebase ({error}).</p>}
      {!ready ? (
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Cargando cuentas…</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {balances.map((a) => (
              <AccountCard key={a.id} name={a.name} balance={a.balance} />
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(201,168,76,0.08)',
              border: `1px solid ${C.gold}55`,
              borderRadius: 12,
              padding: '14px 18px',
            }}
          >
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
              Total sumado entre cuentas
            </span>
            <span style={{ fontSize: 24, fontWeight: 800, color: C.gold }}>{fmtMoney(total)}</span>
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 14, marginBottom: 0 }}>
            Los saldos se calculan a partir de los pagos e ingresos confirmados (próximamente en esta sección).
          </p>
        </>
      )}
    </Section>
  )
}
