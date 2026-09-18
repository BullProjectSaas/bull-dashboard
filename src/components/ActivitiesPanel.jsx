import { useState } from 'react'
import { C } from '../theme'
import Section from './Section'
import { inputStyle, selectStyle } from './admin/formStyles'
import { fmtDateShort } from '../utils/metrics'

const CATEGORIES = ['Presupuesto', 'Vendedor', 'Creativo', 'Otro']
const CATEGORY_COLOR = { Presupuesto: C.gold, Vendedor: C.green, Creativo: C.amber, Otro: C.muted }

const todayKey = () => new Date().toISOString().slice(0, 10)

function CategoryBadge({ category }) {
  const color = CATEGORY_COLOR[category] || C.muted
  return (
    <span
      style={{
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
      {category}
    </span>
  )
}

export default function ActivitiesPanel({ activities, ready, error, addActivity, removeActivity }) {
  const [date, setDate] = useState(todayKey())
  const [category, setCategory] = useState(CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    setSaving(true)
    await addActivity(date, category, description).catch(() => {})
    setSaving(false)
    setDescription('')
  }

  return (
    <Section title="Actividades y cambios">
      <p style={{ fontSize: 12, color: C.muted, marginTop: 0 }}>
        Registrá cambios en la campaña o el embudo (presupuesto, vendedor, creativo, etc.) para
        poder comparar las métricas de antes y después desde el filtro de fecha.
      </p>

      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...inputStyle, flex: 'unset', width: 150 }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          placeholder="Descripción (ej: se subió el presupuesto a $50.000/día)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, flex: 2 }}
        />
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
        <p style={{ fontSize: 13, color: C.muted }}>Cargando actividades…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {activities.map((a) => (
            <div
              key={a.id}
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
              <span style={{ fontSize: 12, color: C.muted, width: 60 }}>{fmtDateShort(a.date)}</span>
              <CategoryBadge category={a.category} />
              <span style={{ fontSize: 13, flex: 1 }}>{a.description}</span>
              <button
                onClick={() => removeActivity(a.id)}
                title="Eliminar"
                style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            </div>
          ))}
          {!activities.length && <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Todavía no hay actividades cargadas.</p>}
        </div>
      )}
    </Section>
  )
}
