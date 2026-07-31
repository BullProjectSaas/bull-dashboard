// Lightweight shared-password gate for the internal panel. This is NOT real security —
// anyone who reads the bundle can see the check — it's meant to keep the internal client
// list out of casual/accidental view, same trust model as the rest of this app (no login
// system anywhere). Swap PASSWORD_HASH to change the password; see comment below.
const PASSWORD_HASH = '086d1e4d0f88dfeedd35e028cb9465479cde87f81e9143cf9f8c18feec88c299'
const STORAGE_KEY = 'bull_admin_unlocked'

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function checkPassword(input) {
  const hash = await sha256Hex(input)
  return hash === PASSWORD_HASH
}

export function isUnlocked() {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function unlock() {
  localStorage.setItem(STORAGE_KEY, '1')
}

export function lock() {
  localStorage.removeItem(STORAGE_KEY)
}
