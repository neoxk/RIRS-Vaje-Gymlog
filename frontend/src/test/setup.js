import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// pomožna funkcija za odgovor fetch
export function odgovor(status, telo) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(telo) })
}
