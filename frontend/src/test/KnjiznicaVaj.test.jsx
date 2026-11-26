import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import KnjiznicaVaj from '../pages/KnjiznicaVaj.jsx'
import { odgovor } from './setup.js'

const VAJE = [
  { _id: '1', naziv: 'Počep', misicnaSkupina: 'noge', oprema: 'drog', opis: 'Spusti se v počep.' },
  { _id: '2', naziv: 'Zgib', misicnaSkupina: 'hrbet', oprema: 'drog za zgibe', opis: '' },
]

describe('KnjiznicaVaj', () => {
  it('prikaže vaje z nazivom, skupino in opremo ter ob kliku opis', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => odgovor(200, VAJE))
    render(<KnjiznicaVaj />)

    expect(await screen.findByText('Počep')).toBeInTheDocument()
    expect(screen.getByText('drog za zgibe')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Počep'))
    expect(screen.getByText('Spusti se v počep.')).toBeInTheDocument()
  })

  it('ob izbiri skupine pošlje filter in pokaže sporočilo za prazno skupino', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation((url) => odgovor(200, url.includes('trebuh') ? [] : VAJE))
    render(<KnjiznicaVaj />)
    await screen.findByText('Počep')

    await userEvent.click(screen.getByRole('button', { name: 'Trebuh' }))

    expect(fetch).toHaveBeenLastCalledWith('/api/vaje?misicnaSkupina=trebuh')
    expect(await screen.findByText('Ni vaj v tej skupini')).toBeInTheDocument()
  })
})
