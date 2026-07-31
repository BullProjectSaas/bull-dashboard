import { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { C } from '../../theme'
import { STATUS_META, adStatus } from '../../utils/board'
import { fmtROAS } from '../../utils/metrics'

export default function AdNode({ id, data }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const editable = !data.linkedAd

  const status = adStatus(data.adData)
  const meta = STATUS_META[status]

  const commit = () => {
    setEditing(false)
    if (label.trim() && label !== data.label) data.onRename(id, label.trim())
  }

  return (
    <div
      style={{
        background: meta.color,
        color: meta.text,
        border: `2px solid ${C.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 170,
        boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>Anuncio</span>
        <button
          onClick={() => data.onDelete(id)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, opacity: 0.6, color: meta.text }}
        >
          ✕
        </button>
      </div>
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          style={{ fontSize: 14, fontWeight: 800, marginTop: 2, width: '100%', border: 'none', background: 'transparent', color: meta.text }}
        />
      ) : (
        <div
          style={{ fontSize: 14, fontWeight: 800, marginTop: 2, cursor: editable ? 'text' : 'default' }}
          onDoubleClick={() => editable && setEditing(true)}
        >
          {data.label}
        </div>
      )}
      {data.adData && (
        <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>
          {fmtROAS(data.adData.roas)} · {data.adData.ventasCount} ventas · {data.adData.leadsCount} leads
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
