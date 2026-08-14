import { C } from '../theme'
import Section from './Section'

export default function NutricionAdsPanel({ adNames, excludedAdNames, onToggle }) {
  const excluded = new Set(excludedAdNames)

  return (
    <Section title="Anuncios de nutrición (excluir del conteo de leads)">
      <p style={{ fontSize: 12, color: C.muted, marginTop: 0 }}>
        Marcá los anuncios cuyo objetivo no es generar leads (ej. visitas al perfil) — solo aplica
        para clientes sin datos de Tally leads, donde el conteo de leads sale de la columna
        "Results" de la métrica de anuncios.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {adNames.map((name) => (
          <label
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: C.bg3,
              border: `1px solid ${C.border}`,
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              color: C.text,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" checked={excluded.has(name)} onChange={(e) => onToggle(name, e.target.checked)} />
            {name}
          </label>
        ))}
        {!adNames.length && <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Todavía no hay anuncios con datos.</p>}
      </div>
    </Section>
  )
}
