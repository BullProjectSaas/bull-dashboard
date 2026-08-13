import { useState } from 'react'
import { C } from '../../theme'
import { CLIENT_TAGS, tagColor } from '../../utils/clientTags'
import { DEFAULT_ROAS_BREAKEVEN } from '../../utils/alerts'
import { inputStyle, selectStyle } from './formStyles'
import AddClientForm from './AddClientForm'
import Section from '../Section'

function TagBadge({ value }) {
  if (!value) return <span style={{ fontSize: 11, color: C.muted }}>Sin etiqueta</span>
  const color = tagColor(value)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 700,
        color,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderRadius: 999,
        padding: '3px 9px',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {value}
    </span>
  )
}

function ClientRow({ client, updateClient, removeClient }) {
  const [celula, setCelula] = useState(client.celula || '')
  const [breakeven, setBreakeven] = useState(client.roasBreakeven ?? DEFAULT_ROAS_BREAKEVEN)
  const [excludedInput, setExcludedInput] = useState((client.excludedAdNames || []).join(', '))

  const saveCelula = () => {
    if (celula.trim() !== (client.celula || '')) updateClient(client.sheetId, { celula: celula.trim() })
  }

  const saveBreakeven = () => {
    const n = Number(breakeven)
    const value = n > 0 ? n : DEFAULT_ROAS_BREAKEVEN
    if (value !== (client.roasBreakeven ?? DEFAULT_ROAS_BREAKEVEN)) updateClient(client.sheetId, { roasBreakeven: value })
  }

  const saveExcludedAdNames = () => {
    const list = Array.from(new Set(excludedInput.split(',').map((s) => s.trim()).filter(Boolean)))
    updateClient(client.sheetId, { excludedAdNames: list })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ flex: '1 1 140px', fontWeight: 600, fontSize: 13 }}>{client.name}</span>

        <input
          list="celulas-list"
          placeholder="Célula"
          value={celula}
          onChange={(e) => setCelula(e.target.value)}
          onBlur={saveCelula}
          style={{ ...inputStyle, flex: '0 1 140px', minWidth: 110, padding: '6px 10px' }}
        />

        <select
          value={client.etiqueta || ''}
          onChange={(e) => updateClient(client.sheetId, { etiqueta: e.target.value })}
          style={{ ...selectStyle, minWidth: 150, padding: '6px 10px' }}
        >
          <option value="">Sin etiqueta</option>
          {CLIENT_TAGS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.value}
            </option>
          ))}
        </select>

        <TagBadge value={client.etiqueta} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted }}>
          Breakeven
          <input
            type="number"
            step="0.1"
            min="0"
            value={breakeven}
            onChange={(e) => setBreakeven(e.target.value)}
            onBlur={saveBreakeven}
            style={{ ...inputStyle, flex: 'unset', width: 60, minWidth: 0, padding: '6px 8px' }}
          />
          x
        </label>

        <span style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>
          {client.sheetId.slice(0, 8)}…{client.sheetId.slice(-4)}
        </span>
        <a
          href={`${import.meta.env.BASE_URL}?sheet=${client.sheetId}`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, color: C.gold, textDecoration: 'none', fontWeight: 600 }}
        >
          Ver dashboard ↗
        </a>
        <button
          onClick={() => removeClient(client.sheetId)}
          title="Quitar cliente"
          style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14 }}
        >
          ✕
        </button>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.muted }}>
        Anuncios de nutrición (excluir de leads)
        <input
          placeholder="Nombres de anuncio separados por coma — solo aplica si el cliente no usa Tally leads"
          value={excludedInput}
          onChange={(e) => setExcludedInput(e.target.value)}
          onBlur={saveExcludedAdNames}
          style={{ ...inputStyle, padding: '6px 10px' }}
        />
      </label>
    </div>
  )
}

export default function ClientManager({ clients, ready, error, addClient, updateClient, removeClient }) {
  return (
    <Section title="Gestionar clientes">
      <div style={{ marginBottom: 18 }}>
        <AddClientForm clients={clients} addClient={addClient} />
      </div>

      {error && <p style={{ fontSize: 12, color: C.red, marginTop: 0 }}>No se pudo sincronizar con Firebase ({error}).</p>}
      {!ready && <p style={{ fontSize: 13, color: C.muted }}>Cargando clientes…</p>}

      {ready && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {clients.map((c) => (
            <ClientRow key={c.sheetId} client={c} updateClient={updateClient} removeClient={removeClient} />
          ))}
          {!clients.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Todavía no agregaste ningún cliente.</p>}
        </div>
      )}
    </Section>
  )
}
