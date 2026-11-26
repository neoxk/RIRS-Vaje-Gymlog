import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Registracija from '../pages/Registracija.jsx'
import { odgovor } from './setup.js'

function izrisi() {
  return render(
    <MemoryRouter initialEntries={['/registracija']}>
      <Routes>
        <Route path="/registracija" element={<Registracija />} />
        <Route path="/prijava" element={<p>Stran za prijavo</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Registracija', () => {
  it('prikaže napake po poljih, ki jih vrne strežnik', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      odgovor(400, {
        napaka: 'Neveljavni podatki',
        polja: { email: 'E-poštni naslov ni veljaven', geslo: 'Geslo mora imeti vsaj 8 znakov' },
      }),
    )
    izrisi()

    await userEvent.type(screen.getByLabelText('E-poštni naslov'), 'ni-email')
    await userEvent.click(screen.getByRole('button', { name: 'Ustvari račun' }))

    expect(await screen.findByText('E-poštni naslov ni veljaven')).toBeInTheDocument()
    expect(screen.getByText('Geslo mora imeti vsaj 8 znakov')).toBeInTheDocument()
  })

  it('po uspešni registraciji preusmeri na prijavo', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => odgovor(201, { vloga: 'clan' }))
    izrisi()

    await userEvent.type(screen.getByLabelText('Ime'), 'Ana')
    await userEvent.type(screen.getByLabelText('E-poštni naslov'), 'ana@test.si')
    await userEvent.type(screen.getByLabelText('Geslo (vsaj 8 znakov)'), 'dolgogeslo')
    await userEvent.click(screen.getByRole('button', { name: 'Ustvari račun' }))

    expect(await screen.findByText('Stran za prijavo')).toBeInTheDocument()
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      ime: 'Ana',
      email: 'ana@test.si',
      geslo: 'dolgogeslo',
    })
  })
})
