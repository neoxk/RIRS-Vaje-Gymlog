import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../useAuth.js'
import ProtectedRoute from '../ProtectedRoute.jsx'

function izrisi(user) {
  return render(
    <AuthContext.Provider value={{ user, nalaganje: false }}>
      <MemoryRouter initialEntries={['/nacrti/nov']}>
        <Routes>
          <Route path="/prijava" element={<p>Stran za prijavo</p>} />
          <Route
            path="/nacrti/nov"
            element={
              <ProtectedRoute vloge={['trener']}>
                <p>Obrazec za načrt</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('neprijavljenega uporabnika preusmeri na prijavo', () => {
    izrisi(null)
    expect(screen.getByText('Stran za prijavo')).toBeInTheDocument()
  })

  it('uporabniku z napačno vlogo pokaže, da nima dostopa', () => {
    izrisi({ ime: 'Ana', vloga: 'clan' })
    expect(screen.getByText('Ni dostopa')).toBeInTheDocument()
    expect(screen.queryByText('Obrazec za načrt')).not.toBeInTheDocument()
  })

  it('uporabniku s pravo vlogo pokaže stran', () => {
    izrisi({ ime: 'Tine', vloga: 'trener' })
    expect(screen.getByText('Obrazec za načrt')).toBeInTheDocument()
  })
})
