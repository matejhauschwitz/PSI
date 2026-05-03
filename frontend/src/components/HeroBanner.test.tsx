import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import HeroBanner from './HeroBanner'

describe('HeroBanner', () => {
  const mockBestseller = {
    id: 1,
    title: 'Nejlepší Kniha',
    author: 'Slavný Autor',
    rating: 4.5,
    coverImageUrl: 'http://test.com/bestseller.jpg'
  }

  beforeEach(() => {
    // Před každým testem vyčistíme localStorage, aby se stavy testů neovlivňovaly
    localStorage.clear()
    vi.clearAllMocks()
  })

  // Pomocná funkce pro zabalení do Routeru, protože komponenta používá <Link>[cite: 16]
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
  }

  it('zobrazí text načítání, když loading=true[cite: 16]', () => {
    renderWithRouter(<HeroBanner bestseller={null} loading={true} />)
    expect(screen.getByText('Načítám bestseller...')).toBeInTheDocument()
  })

  it('zobrazí tlačítko Přihlásit, pokud uživatel není přihlášený[cite: 16]', () => {
    renderWithRouter(<HeroBanner bestseller={mockBestseller as any} loading={false} />)
    
    // Tlačítko Procházet by tam mělo být vždycky[cite: 16]
    expect(screen.getByText('Procházet')).toBeInTheDocument()
    
    const loginLink = screen.getByText('Přihlásit')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
    
    expect(screen.queryByText('Mé Oblíbené')).not.toBeInTheDocument()
  })

  it('zobrazí tlačítko Mé Oblíbené, pokud je uživatel přihlášený (má token v localStorage)[cite: 16]', () => {
    localStorage.setItem('jwt_token', 'fake-token')
    renderWithRouter(<HeroBanner bestseller={mockBestseller as any} loading={false} />)
    
    const favLink = screen.getByText('Mé Oblíbené')
    expect(favLink).toBeInTheDocument()
    expect(favLink).toHaveAttribute('href', '/favourites')
    
    expect(screen.queryByText('Přihlásit')).not.toBeInTheDocument()
  })

  it('vykreslí detaily bestselleru, pokud jsou k dispozici[cite: 16]', () => {
    renderWithRouter(<HeroBanner bestseller={mockBestseller as any} loading={false} />)
    
    expect(screen.getByText('Bestseller')).toBeInTheDocument()
    expect(screen.getByText('Nejlepší Kniha')).toBeInTheDocument()
    expect(screen.getByText('Slavný Autor')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'http://test.com/bestseller.jpg')
    expect(img).toHaveAttribute('alt', 'Nejlepší Kniha')
  })

  it('vykreslí zástupný symbol, pokud bestseller nemá obrázek[cite: 16]', () => {
    const noImageBestseller = { ...mockBestseller, coverImageUrl: undefined }
    renderWithRouter(<HeroBanner bestseller={noImageBestseller as any} loading={false} />)
    
    // Obrázek by tam být neměl
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    
    // Ale textové informace by měly být stále viditelné[cite: 16]
    expect(screen.getByText('Nejlepší Kniha')).toBeInTheDocument() 
  })
})