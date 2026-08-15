const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

initializeApp()
const db = getFirestore()

const GRAPH_VERSION = 'v21.0'

const WHATSAPP_TOKEN = defineSecret('WHATSAPP_TOKEN')
const WHATSAPP_PHONE_NUMBER_ID = defineSecret('WHATSAPP_PHONE_NUMBER_ID')
const WHATSAPP_VERIFY_TOKEN = defineSecret('WHATSAPP_VERIFY_TOKEN')
const APP_SHARED_SECRET = defineSecret('APP_SHARED_SECRET')

// --- POC 1/2/3: recibe mensajes y datos de atribución Click-to-WhatsApp desde Meta ---
exports.whatsappWebhook = onRequest({ secrets: [WHATSAPP_VERIFY_TOKEN], cors: false }, async (req, res) => {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN.value()) {
      res.status(200).send(challenge)
    } else {
      res.status(403).send('Forbidden')
    }
    return
  }

  if (req.method === 'POST') {
    try {
      await handleIncoming(req.body)
    } catch (err) {
      console.error('webhook handling error', err)
    }
    // Meta espera 200 rápido; si no, reintenta con backoff y puede deshabilitar el webhook.
    res.status(200).send('EVENT_RECEIVED')
    return
  }

  res.status(405).send('Method Not Allowed')
})

async function handleIncoming(body) {
  const entries = body?.entry || []
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const value = change.value || {}
      await Promise.all([
        ...(value.messages || []).map((message) => saveIncomingMessage(message, value.contacts || [])),
        ...(value.statuses || []).map((status) => saveStatusUpdate(status)),
      ])
    }
  }
}

async function saveIncomingMessage(message, contacts) {
  const waId = message.from
  const contact = contacts.find((c) => c.wa_id === waId)
  const referral = message.referral || null
  const text = extractText(message)
  const conversationRef = db.collection('conversations').doc(waId)

  await conversationRef.set(
    {
      waId,
      name: contact?.profile?.name || null,
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageText: text,
      lastMessageDirection: 'in',
      unread: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
      ...(referral
        ? {
            attribution: {
              ctwaClid: referral.ctwa_clid || null,
              sourceId: referral.source_id || null,
              sourceUrl: referral.source_url || null,
              sourceType: referral.source_type || null,
              headline: referral.headline || null,
              body: referral.body || null,
              mediaType: referral.media_type || null,
              // Campaign/Ad Set/Ad ID reales se resuelven después vía Marketing API a partir de source_id/ctwa_clid.
            },
          }
        : {}),
    },
    { merge: true },
  )

  await conversationRef
    .collection('messages')
    .doc(message.id)
    .set({
      waMessageId: message.id,
      direction: 'in',
      type: message.type,
      text,
      raw: message,
      timestamp: message.timestamp ? new Date(Number(message.timestamp) * 1000) : FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    })
}

async function saveStatusUpdate(status) {
  const waId = status.recipient_id
  if (!waId || !status.id) return
  await db
    .collection('conversations')
    .doc(waId)
    .collection('messages')
    .doc(status.id)
    .set({ status: status.status, statusUpdatedAt: FieldValue.serverTimestamp() }, { merge: true })
}

function extractText(message) {
  if (message.type === 'text') return message.text?.body || ''
  if (message.type === 'image') return '[imagen]'
  if (message.type === 'audio') return '[audio]'
  if (message.type === 'document') return '[documento]'
  if (message.type === 'video') return '[video]'
  if (message.type === 'sticker') return '[sticker]'
  return `[${message.type}]`
}

// --- Envío de mensajes de texto desde el CRM hacia WhatsApp Cloud API ---
exports.sendWhatsappMessage = onRequest(
  { secrets: [WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, APP_SHARED_SECRET], cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed')
      return
    }
    if (req.header('x-app-secret') !== APP_SHARED_SECRET.value()) {
      res.status(401).send('Unauthorized')
      return
    }

    const { to, text } = req.body || {}
    if (!to || !text) {
      res.status(400).json({ error: 'Faltan los campos to/text' })
      return
    }

    try {
      const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID.value()
      const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: text },
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        console.error('graph api error', data)
        res.status(502).json({ error: data })
        return
      }

      const waMessageId = data.messages?.[0]?.id || `local_${Date.now()}`
      const conversationRef = db.collection('conversations').doc(to)
      await conversationRef.set(
        {
          waId: to,
          lastMessageAt: FieldValue.serverTimestamp(),
          lastMessageText: text,
          lastMessageDirection: 'out',
          unread: 0,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
      await conversationRef.collection('messages').doc(waMessageId).set({
        waMessageId,
        direction: 'out',
        type: 'text',
        text,
        status: 'sent',
        timestamp: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      })

      res.status(200).json({ ok: true, waMessageId })
    } catch (err) {
      console.error('send error', err)
      res.status(500).json({ error: 'internal_error' })
    }
  },
)
