import { useState } from 'react'
import { Handle, Position } from 'reactflow'
import { C } from '../../theme'

const PALETTE = ['#E8EDF2', '#F2C94C', '#7BD98A', '#22C55E', '#EF4444', '#8899AA']

export default function GroupNode({ id, data }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(data.label)

  const commit = () => {
    setEditing(false)
    if (label.trim() && label !== data.label) data.onRename(id, label.trim())
  }

  return (
    <div
      style={{
        background: data.color || '#E8EDF2',
        color: '#0F1923',
        border: `2px solid ${C.border}`,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 170,
        boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', opacity: 0.7 }}>
          {data.kind === 'campaign' ? 'Campaña' : 'Conjunto'}
        </span>
        <button onClick={() => data.onDelete(id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, opacity: 0.6 }}>
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
          style={{ fontSize: 14, fontWeight: 800, marginTop: 2, width: '100%', border: 'none', background: 'transparent' }}
        />
      ) : (
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2, cursor: 'text' }} onDoubleClick={() => setEditing(true)}>
          {data.label}
        </div>
      )}
      <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => data.onColorChange(id, c)}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: c,
              border: c === data.color ? '2px solid #0F1923' : '1px solid rgba(0,0,0,0.25)',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
