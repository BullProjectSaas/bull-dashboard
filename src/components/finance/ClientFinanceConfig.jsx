import { useState } from 'react'
import { C } from '../../theme'
import Section from '../Section'
import { inputStyle, selectStyle } from '../admin/formStyles'
import { useClients } from '../../hooks/useClients'
import { NIVEL_OPTIONS } from '../../utils/financeDefaults'

const cellInput = { ...inputStyle, flex: 'unset', width: 130, padding: '6px 10px', minWidth: 0 }

function TramosEditor({ client, updateClient }) {
  const [tramos, setTramos] = useState(client.tramosComision || [])
  const [saving, setSaving] = useState(false)

  const setRow = (i, patch) => setTramos((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setTramos((rows) => [...rows, { min: 0, max: 0, pct: 0 }])
  const removeRow = (i) => setTramos((rows) => rows.filter((_, idx) => idx !== i))

  const save = async () => {
    setSaving(true)
    await updateClient(client.sheetId, {
      tramosComision: tramos.map((r) => ({ min: Number(r.min) || 0, max: Number(r.max) || 0, pct: Number(r.pct) || 0 })),
    })
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tramos.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="number" placeholder="Desde" value={r.min} onChange={(e) => setRow(i, { min: e.target.value })} style={cellInput} />
          <input type="number" placeholder="Hasta" value={r.max} onChange={(e) => setRow(i, { max: e.target.value })} style={cellInput} />
          <input type="number" step="0.1" placeholder="%" value={r.pct} onChange={(e) => setRow(i, { pct: e.target.value })} style={{ ...cellInput, width: 80 }} />
          <button onClick={() => removeRow(i)} style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={addRow}
          style={{ background: 'transparent', color: C.gold, border: `1px solid ${C.gold}55`, borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}
        >
          + Agregar tramo
        </button>
        <button
          onClick={save}
          disabled={saving}
          style={{ background: C.gold, color: C.bg, border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando…' : 'Guardar tramos'}
        </button>
      </div>
    </div>
  )
}

function ClientFinanceRow({ client, updateClient }) {
  const [recurPct, setRecurPct] = useState(client.recurrencia?.pct ?? '')

  const saveRecurPct = () => {
    const pct = Number(recurPct) || 0
    updateClient(client.sheetId, { recurrencia: { activo: client.recurrencia?.activo ?? false, pct } })
  }

  const toggleRecurrencia = (activo) => {
    updateClient(client.sheetId, { recurrencia: { activo, pct: Number(recurPct) || 0 } })
  }

  return (
    <div
      style={{
        background: C.bg3,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, flex: '1 1 160px' }}>{client.name}</span>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: C.muted }}>
          Nivel de reparto
          <select
            value={client.nivelReparto || ''}
            onChange={(e) => updateClient(client.sheetId, { nivelReparto: e.target.value })}
            style={{ ...selectStyle, minWidth: 200, padding: '7px 10px' }}
          >
            <option value="">Sin definir</option>
            {NIVEL_OPTIONS.map((n) => (
              <option key={n.value} value={n.value}>{n.label}</option>
            ))}
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted, cursor: 'pointer' }}>
          <input type="checkbox" checked={Boolean(client.recurrencia?.activo)} onChange={(e) => toggleRecurrencia(e.target.checked)} />
          Cobra por recurrencia
        </label>

        {client.recurrencia?.activo && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: C.muted }}>
            % venta recurrente
            <input
              type="number"
              step="0.1"
              min="0"
              value={recurPct}
              onChange={(e) => setRecurPct(e.target.value)}
              onBlur={saveRecurPct}
              style={{ ...inputStyle, flex: 'unset', width: 90, padding: '7px 10px' }}
            />
          </label>
        )}
      </div>

      <div>
        <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Tramos de comisión (sobre la base comisionable de ventas nuevas)
        </div>
        <TramosEditor client={client} updateClient={updateClient} />
      </div>
    </div>
  )
}

export default function ClientFinanceConfig() {
  const { clients, ready, error, updateClient } = useClients(true)

  return (
    <Section title="Configuración financiera por cliente">
      {error && <p style={{ fontSize: 12, color: C.red, marginTop: 0 }}>No se pudo sincronizar con Firebase ({error}).</p>}
      {!ready ? (
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Cargando clientes…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clients.map((c) => (
            <ClientFinanceRow key={c.sheetId} client={c} updateClient={updateClient} />
          ))}
          {!clients.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Todavía no hay clientes cargados.</p>}
        </div>
      )}
    </Section>
  )
}
