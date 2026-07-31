import { useMemo, useState } from 'react'
import { C } from '../../theme'
import { CLIENT_TAGS, tagColor } from '../../utils/clientTags'
import Section from '../Section'

const inputStyle = {
  background: C.bg3,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  flex: 1,
  minWidth: 140,
}

const selectStyle = {
  ...inputStyle,
  flex: 'unset',
  minWidth: 170,
}

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

  const saveCelula = () => {
    if (celula.trim() !== (client.celula || '')) updateClient(client.sheetId, { celula: celula.trim() })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
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
  )
}

export default function ClientManager({ clients, ready, error, addClient, updateClient, removeClient }) {
  const [name, setName] = useState('')
  const [sheetId, setSheetId] = useState('')
  const [celula, setCelula] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [saving, setSaving] = useState(false)

  const celulas = useMemo(
    () => Array.from(new Set(clients.map((c) => c.celula).filter(Boolean))).sort(),
    [clients],
  )

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !sheetId.trim()) return
    setSaving(true)
    await addClient(name, sheetId, celula, etiqueta).catch(() => {})
    setSaving(false)
    setName('')
    setSheetId('')
    setCelula('')
    setEtiqueta('')
  }

  return (
    <Section title="Gestionar clientes">
      <datalist id="celulas-list">
        {celulas.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <input placeholder="Nombre del cliente" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input placeholder="Sheet ID (pegar acá)" value={sheetId} onChange={(e) => setSheetId(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
        <input list="celulas-list" placeholder="Célula" value={celula} onChange={(e) => setCelula(e.target.value)} style={inputStyle} />
        <select value={etiqueta} onChange={(e) => setEtiqueta(e.target.value)} style={selectStyle}>
          <option value="">Sin etiqueta</option>
          {CLIENT_TAGS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.value}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: C.gold,
            color: C.bg,
            border: 'none',
            borderRadius: 10,
            padding: '9px 18px',
            fontWeight: 700,
            fontSize: 13,
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Guardando…' : 'Agregar'}
        </button>
      </form>

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
