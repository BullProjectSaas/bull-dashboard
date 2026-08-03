import { useState } from 'react'
import { C } from '../../theme'
import Section from '../Section'
import CompactDateFilter from '../admin/CompactDateFilter'
import AccountsOverview from './AccountsOverview'

export default function FinanceDashboard() {
  const [range, setRange] = useState({ from: '', to: '' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <CompactDateFilter range={range} onChange={setRange} />
      </div>

      <AccountsOverview />

      <Section title="Gastos e ingresos por categoría">
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          Próximamente — estas métricas van a respetar el filtro de fecha de arriba una vez que
          esté el módulo de pagos e ingresos.
        </p>
      </Section>
    </div>
  )
}
