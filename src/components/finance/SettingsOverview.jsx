import { C } from '../../theme'
import Section from '../Section'
import { fmtMoney } from '../../utils/financeFormat'

const pct = (v) => `${Math.round(v * 100)}%`

const th = { textAlign: 'left', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, padding: '6px 10px', borderBottom: `1px solid ${C.border}` }
const td = { fontSize: 13, color: C.text, padding: '8px 10px', borderBottom: `1px solid ${C.border}` }

export default function SettingsOverview({ settings }) {
  if (!settings) {
    return (
      <Section title="Configuración fija">
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          Todavía no se inicializó la configuración — usá el botón de arriba.
        </p>
      </Section>
    )
  }

  const { tramosEquipoBull, nivelesReparto, directivosTiers, isaTemplates } = settings

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Section title="Tramos equipo / Bull (sobre la comisión cobrada al cliente)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Tramo</th>
              <th style={th}>% Equipo</th>
              <th style={th}>% Bull</th>
            </tr>
          </thead>
          <tbody>
            {tramosEquipoBull.map((t, i) => (
              <tr key={i}>
                <td style={td}>{fmtMoney(t.min)} – {fmtMoney(t.max)}</td>
                <td style={td}>{pct(t.equipoPct)}</td>
                <td style={td}>{pct(t.bullPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Niveles de reparto interno (por cliente)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Nivel</th>
              <th style={th}>PM</th>
              <th style={th}>Trafficker</th>
              <th style={th}>Creativo</th>
              <th style={th}>CM</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(nivelesReparto).map(([key, nivel]) => (
              <tr key={key}>
                <td style={td}>{nivel.label}</td>
                {['pm', 'trafficker', 'creativo', 'cm'].map((role) => (
                  <td style={td} key={role}>{nivel.roles[role] ? pct(nivel.roles[role]) : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Escalones de directivos (sobre el Fondo de Bull mensual agregado)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Hasta</th>
              <th style={th}>R. Inversión</th>
              <th style={th}>R. Operativa</th>
              <th style={th}>COO</th>
              <th style={th}>CEO</th>
            </tr>
          </thead>
          <tbody>
            {directivosTiers.map((t, i) => (
              <tr key={i}>
                <td style={td}>{fmtMoney(t.max)}</td>
                <td style={td}>{pct(t.reservaInversionPct)}</td>
                <td style={td}>{pct(t.reservaOperativaPct)}</td>
                <td style={td}>{pct(t.cooPct)}</td>
                <td style={td}>{pct(t.ceoPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Plantillas ISA (fee fijo de ingreso a Bull)">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Plantilla</th>
              <th style={th}>Monto</th>
              <th style={th}>PM</th>
              <th style={th}>Trafficker</th>
              <th style={th}>Creativo</th>
              <th style={th}>Fondo de Bull</th>
            </tr>
          </thead>
          <tbody>
            {isaTemplates.map((t) => (
              <tr key={t.key}>
                <td style={td}>{t.label}</td>
                <td style={td}>US$ {t.amountUSD}</td>
                <td style={td}>US$ {t.splits.pm}</td>
                <td style={td}>US$ {t.splits.trafficker}</td>
                <td style={td}>US$ {t.splits.creativo}</td>
                <td style={td}>US$ {t.splits.fondoBull}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}
