const FUNCTION_URL = import.meta.env.VITE_WHATSAPP_SEND_URL
const APP_SECRET = import.meta.env.VITE_WHATSAPP_APP_SECRET

export async function sendWhatsappMessage(to, text) {
  if (!FUNCTION_URL) {
    throw new Error('Falta configurar VITE_WHATSAPP_SEND_URL (ver WHATSAPP_SETUP.md)')
  }
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': APP_SECRET || '',
    },
    body: JSON.stringify({ to, text }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ? JSON.stringify(data.error) : `Error ${res.status} al enviar`)
  }
  return res.json()
}
