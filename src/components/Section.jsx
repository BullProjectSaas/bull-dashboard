import { C } from '../theme'

export default function Section({ title, actions, children }) {
  return (
    <section
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  )
}
