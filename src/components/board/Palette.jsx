import { C } from '../../theme'
import { STATUS_META, adStatus, getAvailableAds, getKnownGroups } from '../../utils/board'
import { fmtROAS } from '../../utils/metrics'

const chipStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: '100%',
  textAlign: 'left',
  background: C.bg3,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 12,
  color: C.text,
  cursor: 'pointer',
}

const sectionTitle = { fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.4, margin: '14px 0 6px' }

const manualBtn = {
  background: 'transparent',
  border: `1px dashed ${C.border}`,
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 12,
  color: C.muted,
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
}

export default function Palette({ byAd, tally, placedAdNames, placedGroupNames, onAddAd, onAddGroup, onAddManualAd }) {
  const availableAds = getAvailableAds(byAd, placedAdNames)
  const { campaigns, adsets } = getKnownGroups(tally)
  const availableCampaigns = campaigns.filter((c) => !placedGroupNames.has(c))
  const availableAdsets = adsets.filter((a) => !placedGroupNames.has(a))

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        height: 560,
        minHeight: 0,
        borderRight: `1px solid ${C.border}`,
        paddingRight: 16,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
        Hacé click para agregar un bloque al lienzo y despues arrastralo a su lugar.
      </p>

      <div style={sectionTitle}>Anuncios con datos ({availableAds.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {availableAds.map((ad) => {
          const meta = STATUS_META[adStatus(ad)]
          return (
            <button key={ad.ad} style={chipStyle} onClick={() => onAddAd(ad.ad)}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ad.ad}</span>
              <span style={{ color: C.muted, fontSize: 11 }}>{fmtROAS(ad.roas)}</span>
            </button>
          )
        })}
        {!availableAds.length && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Ya agregaste todos los anuncios con datos.</p>}
      </div>

      <div style={sectionTitle}>Campañas detectadas</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {availableCampaigns.map((name) => (
          <button key={name} style={chipStyle} onClick={() => onAddGroup('campaign', name)}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          </button>
        ))}
        {!availableCampaigns.length && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Nada nuevo por agregar.</p>}
      </div>

      <div style={sectionTitle}>Conjuntos detectados</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {availableAdsets.map((name) => (
          <button key={name} style={chipStyle} onClick={() => onAddGroup('adset', name)}>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          </button>
        ))}
        {!availableAdsets.length && <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>Nada nuevo por agregar.</p>}
      </div>

      <div style={sectionTitle}>Manual</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button style={manualBtn} onClick={() => onAddGroup('campaign', 'Nueva campaña')}>
          + Campaña manual
        </button>
        <button style={manualBtn} onClick={() => onAddGroup('adset', 'Nuevo conjunto')}>
          + Conjunto manual
        </button>
        <button style={manualBtn} onClick={() => onAddManualAd('Nuevo anuncio')}>
          + Anuncio manual
        </button>
      </div>
    </div>
  )
}
