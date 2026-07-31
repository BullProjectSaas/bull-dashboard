import { useState } from 'react'
import { C } from '../../theme'
import Section from '../Section'

const inputStyle = {
  background: C.bg3,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '9px 12px',
  fontSize: 13,
  flex: 1,
  minWidth: 160,
}

export default function ClientManager({ clients, ready, error, addClient, removeClient }) {
  const [name, setName] = useState('')
  const [sheetId, setSheetId] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !sheetId.trim()) return
    setSaving(true)
    await addClient(name, sheetId).catch(() => {})
    setSaving(false)
    setName('')
    setSheetId('')
  }

  return (
    <Section title={`Clientes (${clients.length})`}>
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <input placeholder="Nombre del cliente" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <input placeholder="Sheet ID (pegar acá)" value={sheetId} onChange={(e) => setSheetId(e.target.value)} style={{ ...inputStyle, flex: 2 }} />
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
            <div
              key={c.sheetId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: C.bg3,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: C.muted, fontFamily: 'monospace' }}>
                {c.sheetId.slice(0, 8)}…{c.sheetId.slice(-4)}
              </span>
              <a
                href={`${import.meta.env.BASE_URL}?sheet=${c.sheetId}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: C.gold, textDecoration: 'none', fontWeight: 600 }}
              >
                Ver dashboard ↗
              </a>
              <button
                onClick={() => removeClient(c.sheetId)}
                title="Quitar cliente"
                style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            </div>
          ))}
          {!clients.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Todavía no agregaste ningún cliente.</p>}
        </div>
      )}
    </Section>
  )
}
