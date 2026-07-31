import { C } from '../../theme'
import AddClientForm from './AddClientForm'
import Section from '../Section'

export default function ColaboradorView({ addClient }) {
  return (
    <Section title="Cargar cliente nuevo">
      <p style={{ fontSize: 13, color: C.muted, marginTop: 0 }}>
        Cargá el nombre y el Sheet ID del cliente para sumarlo al resumen general de Bull Partners.
      </p>
      <AddClientForm clients={[]} addClient={addClient} />
    </Section>
  )
}
