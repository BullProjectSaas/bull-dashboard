import { C } from '../../theme'
import Section from '../Section'

export default function ComingSoon({ title }) {
  return (
    <Section title={title}>
      <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Próximamente.</p>
    </Section>
  )
}
