import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../useAuth.js'
import Prijava from '../pages/Prijava.jsx'

describe('Prijava', () => {
  it('prikaže sporočilo o napaki ob neuspešni prijavi', async () => {
    const prijava = vi.fn().mockRejectedValue(new Error('Napačen e-poštni naslov ali geslo'))
    render(
      <AuthContext.Provider value={{ user: null, prijava }}>
        <MemoryRouter>
          <Prijava />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    await userEvent.type(screen.getByLabelText('E-poštni naslov'), 'ana@test.si')
    await userEvent.type(screen.getByLabelText('Geslo'), 'napacno')
    await userEvent.click(screen.getByRole('button', { name: 'Prijava' }))

    expect(prijava).toHaveBeenCalledWith('ana@test.si', 'napacno')
    expect(await screen.findByRole('alert')).toHaveTextContent('Napačen e-poštni naslov ali geslo')
  })
})
