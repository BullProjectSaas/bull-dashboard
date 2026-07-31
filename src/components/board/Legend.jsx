import { C } from '../../theme'
import { STATUS, STATUS_META } from '../../utils/board'

const ORDER = [STATUS.PRODUCCION, STATUS.SEMIVALIDADO, STATUS.ROAS_POSITIVO, STATUS.ROAS_ALTO, STATUS.ROAS_NEGATIVO]

export default function Legend() {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: C.muted }}>
      {ORDER.map((key) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_META[key].color, display: 'inline-block' }} />
          {STATUS_META[key].label}
        </span>
      ))}
    </div>
  )
}
