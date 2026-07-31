import { useEffect, useState } from 'react'
import ClientDashboard from './ClientDashboard'
import AdminApp from './AdminApp'

const isAdminRoute = () => window.location.hash === '#admin'

export default function App() {
  const [admin, setAdmin] = useState(isAdminRoute())

  useEffect(() => {
    const onHashChange = () => setAdmin(isAdminRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return admin ? <AdminApp /> : <ClientDashboard />
}
