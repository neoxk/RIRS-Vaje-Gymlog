import { useEffect, useState } from 'react'
import { AuthContext } from './useAuth.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [nalaganje, setNalaganje] = useState(true)

  // ob nalaganju strani preverimo, ali je seja še veljavna
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setNalaganje(false))
  }, [])

  async function prijava(email, geslo) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, geslo }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.napaka || 'Prijava ni uspela')
    setUser(data)
    return data
  }

  async function odjava() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, nalaganje, prijava, odjava }}>
      {children}
    </AuthContext.Provider>
  )
}
