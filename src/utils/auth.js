// Lightweight shared-password gate for the internal panel, with two tiers. This is NOT
// real security — anyone who reads the bundle can see the check, and it doesn't restrict
// the underlying Firestore data — it's meant to keep casual/accidental access out and
// separate "who sees what" within the team. Swap the hashes below to change a password.
const PASSWORD_HASHES = {
  admin: '1806ca3e53e0c0679f7199270df3e6a09e249f22c6d51eee9dc19231f6febaf7', // Bull3403Directivos
  colaborador: 'c866f1e998289464cc2f55e7a21461d20378d5d4e8f34af06bc8ba05e819a918', // Bull3403Partners
}
const STORAGE_KEY = 'bull_admin_role'

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Returns 'admin', 'colaborador', or null if the password doesn't match either.
export async function checkPassword(input) {
  const hash = await sha256Hex(input)
  const match = Object.entries(PASSWORD_HASHES).find(([, h]) => h === hash)
  return match ? match[0] : null
}

export function getRole() {
  const role = localStorage.getItem(STORAGE_KEY)
  return role === 'admin' || role === 'colaborador' ? role : null
}

export function setRole(role) {
  localStorage.setItem(STORAGE_KEY, role)
}

export function clearRole() {
  localStorage.removeItem(STORAGE_KEY)
}
