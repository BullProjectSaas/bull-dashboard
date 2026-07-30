import { C } from '../theme'

export default function Section({ title, children }) {
  return (
    <section
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '18px 20px',
      }}
    >
      <h2 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
