import { useState } from 'react'
import { C } from '../../theme'
import Section from '../Section'
import { inputStyle, selectStyle } from '../admin/formStyles'
import { ROLE_LABELS } from '../../utils/financeDefaults'
import { useCollaborators } from '../../hooks/useCollaborators'

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)

function CollaboratorRow({ collaborator, updateCollaborator, removeCollaborator }) {
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
      <span style={{ flex: '1 1 160px', fontWeight: 600, fontSize: 13, opacity: collaborator.active ? 1 : 0.5 }}>{collaborator.name}</span>

      <select
        value={collaborator.role}
        onChange={(e) => updateCollaborator(collaborator.id, { role: e.target.value })}
        style={{ ...selectStyle, minWidth: 140, padding: '6px 10px' }}
      >
        {ROLE_OPTIONS.map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={collaborator.active}
          onChange={(e) => updateCollaborator(collaborator.id, { active: e.target.checked })}
        />
        Activo
      </label>

      <button
        onClick={() => removeCollaborator(collaborator.id)}
        title="Eliminar colaborador"
        style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14 }}
      >
        ✕
      </button>
    </div>
  )
}

export default function CollaboradoresPanel() {
  const { collaborators, ready, error, addCollaborator, updateCollaborator, removeCollaborator } = useCollaborators()
  const [name, setName] = useState('')
  const [role, setRole] = useState(ROLE_OPTIONS[0][0])
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await addCollaborator(name, role).catch(() => {})
    setSaving(false)
    setName('')
  }

  return (
    <Section title="Colaboradores">
      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <input placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
          {ROLE_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
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
      {!ready ? (
        <p style={{ fontSize: 13, color: C.muted }}>Cargando colaboradores…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {collaborators.map((c) => (
            <CollaboratorRow key={c.id} collaborator={c} updateCollaborator={updateCollaborator} removeCollaborator={removeCollaborator} />
          ))}
          {!collaborators.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Todavía no hay colaboradores cargados.</p>}
        </div>
      )}
    </Section>
  )
}
