// Navbar.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../context/CartContext'

vi.mock('../hooks/useAuth')
vi.mock('../context/CartContext')

describe('Navbar', () => {
  const mockLogout = vi.fn()

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useCart as Mock).mockReturnValue({ cartCount: 0 })
  })

  it('vykreslí základní odkazy pro nepřihlášeného uživatele[cite: 17]', () => {
    ;(useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      logout: mockLogout
    })

    renderWithRouter(<Navbar />)

    expect(screen.getByText('Knihovna')).toBeInTheDocument()
    expect(screen.getByText('Knihy')).toBeInTheDocument()
    expect(screen.getByText('Košík')).toBeInTheDocument()
    expect(screen.getByText('Přihlášení')).toBeInTheDocument()
    expect(screen.getByText('Registrace')).toBeInTheDocument()

    expect(screen.queryByText('Oblíbené')).not.toBeInTheDocument()
    expect(screen.queryByText('Profil')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('vykreslí odkazy pro přihlášeného uživatele[cite: 17]', () => {
    ;(useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      logout: mockLogout
    })

    renderWithRouter(<Navbar />)

    expect(screen.getByText('Oblíbené')).toBeInTheDocument()
    expect(screen.getByText('Profil')).toBeInTheDocument()
    expect(screen.getByText('Odhlásit')).toBeInTheDocument()

    expect(screen.queryByText('Přihlášení')).not.toBeInTheDocument()
    expect(screen.queryByText('Registrace')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('vykreslí odkaz na Admin panel pro administrátora[cite: 17]', () => {
    ;(useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      logout: mockLogout
    })

    renderWithRouter(<Navbar />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('zobrazí badge s počtem položek v košíku, pokud je větší než 0[cite: 17]', () => {
    ;(useAuth as Mock).mockReturnValue({ isAuthenticated: false })
    ;(useCart as Mock).mockReturnValue({ cartCount: 3 })

    renderWithRouter(<Navbar />)

    const badge = screen.getByText('3')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-red-500')
  })

  it('zavolá logout funkci při kliknutí na Odhlásit[cite: 17]', async () => {
    const user = userEvent.setup()
    ;(useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      logout: mockLogout
    })

    renderWithRouter(<Navbar />)

    const logoutButton = screen.getByText('Odhlásit')
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})