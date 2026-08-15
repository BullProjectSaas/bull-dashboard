import { useEffect, useState } from 'react'
import { C } from '../../theme'
import { useConversations } from '../../hooks/useConversations'
import { useMessages } from '../../hooks/useMessages'
import { sendWhatsappMessage } from '../../utils/sendWhatsapp'

function formatTime(ts) {
  if (!ts) return ''
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function InboxView() {
  const { conversations, ready, error } = useConversations()
  const [selectedId, setSelectedId] = useState(null)
  const { messages } = useMessages(selectedId)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    if (!selectedId && conversations.length > 0) setSelectedId(conversations[0].id)
  }, [conversations, selectedId])

  const selected = conversations.find((c) => c.id === selectedId)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !selectedId) return
    setSending(true)
    setSendError('')
    try {
      await sendWhatsappMessage(selectedId, draft.trim())
      setDraft('')
    } catch (err) {
      setSendError(err.message || 'No se pudo enviar')
    } finally {
      setSending(false)
    }
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: C.red, fontSize: 13 }}>
        No se pudo leer Firestore ({error.message}). Revisá las reglas de seguridad de la colección "conversations".
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 170px)',
        minHeight: 480,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <aside style={{ width: 300, flexShrink: 0, borderRight: `1px solid ${C.border}`, background: C.bg2, overflowY: 'auto' }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
          <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.text, textTransform: 'uppercase', letterSpacing: 1 }}>
            Conversaciones {ready ? `(${conversations.length})` : ''}
          </h2>
        </div>
        {!ready && <div style={{ padding: 16, color: C.muted, fontSize: 13 }}>Cargando…</div>}
        {ready && conversations.length === 0 && (
          <div style={{ padding: 16, color: C.muted, fontSize: 13, lineHeight: 1.5 }}>
            Todavía no llegó ninguna conversación. Escribile por WhatsApp al número conectado para probar el circuito.
          </div>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedId(c.id)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              background: c.id === selectedId ? C.bg3 : 'transparent',
              border: 'none',
              borderBottom: `1px solid ${C.border}`,
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.name || c.waId}</span>
              {!!c.unread && (
                <span style={{ background: C.gold, color: C.bg, borderRadius: 999, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>
                  {c.unread}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.waId}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.lastMessageDirection === 'out' ? 'Vos: ' : ''}
              {c.lastMessageText}
            </div>
            {c.attribution?.ctwaClid && <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>📎 Click-to-WhatsApp</div>}
          </button>
        ))}
      </aside>

      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: C.bg, minWidth: 0 }}>
        {!selected ? (
          <div style={{ margin: 'auto', color: C.muted, fontSize: 13 }}>Seleccioná una conversación</div>
        ) : (
          <>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, background: C.bg2 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{selected.name || selected.waId}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{selected.waId}</div>
              {selected.attribution && (
                <div style={{ fontSize: 11, color: C.gold, marginTop: 4 }}>
                  Origen: {selected.attribution.headline || selected.attribution.sourceType || 'Anuncio Meta'}
                  {selected.attribution.ctwaClid ? ` · ctwa_clid ${selected.attribution.ctwaClid.slice(0, 12)}…` : ''}
                </div>
              )}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.direction === 'out' ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    background: m.direction === 'out' ? C.gold : C.bg3,
                    color: m.direction === 'out' ? C.bg : C.text,
                    borderRadius: 12,
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: 'right' }}>
                    {formatTime(m.timestamp)} {m.direction === 'out' && m.status ? `· ${m.status}` : ''}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: 14, borderTop: `1px solid ${C.border}`, background: C.bg2 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribí un mensaje…"
                style={{ flex: 1, background: C.bg3, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', fontSize: 13 }}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                style={{
                  background: C.gold,
                  color: C.bg,
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 18px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: sending ? 'default' : 'pointer',
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? 'Enviando…' : 'Enviar'}
              </button>
            </form>
            {sendError && <div style={{ padding: '0 14px 10px', color: C.red, fontSize: 12 }}>{sendError}</div>}
          </>
        )}
      </section>
    </div>
  )
}
