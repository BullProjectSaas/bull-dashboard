import { C } from '../theme'

export default function Section({ title, actions, children }) {
  return (
    <section
      style={{
        background: 'linear-gradient(180deg, rgba(30,45,64,0.7), rgba(22,32,48,0.7))',
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: '0 12px 28px -12px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: 2, background: C.gold, display: 'inline-block' }} />
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  )
}
