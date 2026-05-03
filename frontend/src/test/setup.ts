import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Po každém testu vyčistí DOM, aby se testy neovlivňovaly
afterEach(() => {
  cleanup()
})