import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { useAuth } from './hooks/useAuth'

// --- 1. MOCKOVÁNÍ HOOKŮ ---
vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

// --- 2. MOCKOVÁNÍ STRÁNEK A KOMPONENT ---
// Namockujeme všechny stránky jako jednoduché <div> elementy s textem.
// Díky tomu snadno poznáme, na jaké stránce se Router právě nachází.
vi.mock('./pages/HomePage', () => ({ default: () => <div>HomePage Mock</div> }))
vi.mock('./pages/LoginPage', () => ({ default: () => <div>LoginPage Mock</div> }))
vi.mock('./pages/RegisterPage', () => ({ default: () => <div>RegisterPage Mock</div> }))
vi.mock('./pages/BooksPage', () => ({ default: () => <div>BooksPage Mock</div> }))
vi.mock('./pages/BookDetailPage', () => ({ default: () => <div>BookDetailPage Mock</div> }))
vi.mock('./pages/FavouritesPage', () => ({ default: () => <div>FavouritesPage Mock</div> }))
vi.mock('./pages/ProfilePage', () => ({ default: () => <div>ProfilePage Mock</div> }))
vi.mock('./pages/OrderConfirmationPage', () => ({ default: () => <div>OrderConfirmationPage Mock</div> }))
vi.mock('./pages/AdminPage', () => ({ default: () => <div>AdminPage Mock</div> }))

vi.mock('./components/Navbar', () => ({ default: () => <nav>Navbar Mock</nav> }))
vi.mock('./components/Cart', () => ({ default: () => <div>Cart Mock</div> }))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Vyčištění historie prohlížeče před každým testem
    window.history.pushState({}, 'Home', '/')
  })

  it('zobrazí loading obrazovku, pokud se načítá stav přihlášení', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })

    render(<App />)

    expect(screen.getByText('Načítání...')).toBeInTheDocument()
    // Ujistíme se, že se nevykreslil obsah aplikace (Navbar chybí)
    expect(screen.queryByText('Navbar Mock')).not.toBeInTheDocument()
  })

  it('vykreslí veřejnou stránku pro nepřihlášeného uživatele (BooksPage)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    })

    // Změníme URL v jsdom, aby BrowserRouter začal na /books
    window.history.pushState({}, 'Books', '/books')
    render(<App />)

    expect(screen.getByText('Navbar Mock')).toBeInTheDocument()
    expect(screen.getByText('BooksPage Mock')).toBeInTheDocument()
  })

  describe('Chráněné cesty (Protected Routes)', () => {
    it('přesměruje z /profile na /login, pokud uživatel není přihlášený', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false, // Nepřihlášený!
        isAdmin: false,
        loading: false,
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      })

      window.history.pushState({}, 'Profile', '/profile')
      render(<App />)

      // I když jsme šli na /profile, Router by nás měl hodit na LoginPage
      expect(screen.queryByText('ProfilePage Mock')).not.toBeInTheDocument()
      expect(screen.getByText('LoginPage Mock')).toBeInTheDocument()
    })

    it('pustí na /profile, pokud je uživatel přihlášený', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true, // Přihlášený!
        isAdmin: false,
        loading: false,
        user: { id: 1, name: 'Test' } as any,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      })

      window.history.pushState({}, 'Profile', '/profile')
      render(<App />)

      expect(screen.getByText('ProfilePage Mock')).toBeInTheDocument()
      expect(screen.queryByText('LoginPage Mock')).not.toBeInTheDocument()
    })
  })

  describe('Administrátorské cesty (Admin Routes)', () => {
    it('přesměruje z /admin na /login, pokud uživatel nemá roli admin', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true, // Je sice přihlášený...
        isAdmin: false,        // ...ale není admin!
        loading: false,
        user: { id: 1, name: 'Běžný Uživatel' } as any,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      })

      window.history.pushState({}, 'Admin', '/admin')
      render(<App />)

      expect(screen.queryByText('AdminPage Mock')).not.toBeInTheDocument()
      expect(screen.getByText('LoginPage Mock')).toBeInTheDocument()
    })

    it('pustí na /admin, pokud má uživatel roli admin', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true, // Přihlášený
        isAdmin: true,         // Je Admin!
        loading: false,
        user: { id: 1, name: 'Admin', role: 1 } as any,
        login: vi.fn(),
        logout: vi.fn(),
        register: vi.fn(),
      })

      window.history.pushState({}, 'Admin', '/admin')
      render(<App />)

      expect(screen.getByText('AdminPage Mock')).toBeInTheDocument()
    })
  })
})