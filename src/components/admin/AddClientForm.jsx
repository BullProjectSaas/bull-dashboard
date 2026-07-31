import { useMemo, useState } from 'react'
import { C } from '../../theme'
import { CLIENT_TAGS } from '../../utils/clientTags'
import { DEFAULT_ROAS_BREAKEVEN } from '../../utils/alerts'
import { inputStyle, selectStyle } from './formStyles'

export default function AddClientForm({ clients, addClient, onAdded }) {
  const [name, setName] = useState('')
  const [sheetId, setSheetId] = useState('')
  const [celula, setCelula] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [roasBreakeven, setRoasBreakeven] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const celulas = useMemo(
    () => Array.from(new Set((clients || []).map((c) => c.celula).filter(Boolean))).sort(),
    [clients],
  )

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !sheetId.trim()) return
    setSaving(true)
    await addClient(name, sheetId, celula, etiqueta, roasBreakeven).catch(() => {})
    setSaving(false)
    setName('')
    setSheetId('')
    setCelula('')
    setEtiqueta('')
    setRoasBreakeven('')
    setDone(true)
    onAdded?.()
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <>
      <datalist id="celulas-list">
        {celulas.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <form onSubmit={submit} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
        <input
          type="number"
          step="0.1"
          min="0"
          placeholder={`ROAS breakeven (${DEFAULT_ROAS_BREAKEVEN})`}
          value={roasBreakeven}
          onChange={(e) => setRoasBreakeven(e.target.value)}
          style={{ ...inputStyle, flex: 'unset', width: 170 }}
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
      {done && <p style={{ fontSize: 12, color: C.green, margin: '10px 0 0' }}>✓ Cliente agregado.</p>}
    </>
  )
}
