import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BookDetailPage from './BookDetailPage'
import { useBookDetail } from '../hooks/useBookDetail'
import { useCart } from '../context/CartContext'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

// --- MOCKY ---

// 1. Mock hooků
vi.mock('../hooks/useBookDetail', () => ({
  useBookDetail: vi.fn()
}))

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn()
}))

// 2. Mock služeb
vi.mock('../services/api', () => ({
  authService: {
    isAuthenticated: vi.fn()
  }
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  }
}))

// 3. Mock komponent - přidáme tlačítko pro testování onAddToCart propu
vi.mock('../components/BookDetailHeader', () => ({
  default: ({ onAddToCart }: any) => (
    <div data-testid="mock-header">
      <button data-testid="add-to-cart-btn" onClick={onAddToCart}>
        Do košíku
      </button>
    </div>
  )
}))

vi.mock('../components/CommentsSection', () => ({
  default: () => <div data-testid="mock-comments" />
}))

describe('BookDetailPage', () => {
  const user = userEvent.setup()
  const mockAddToCart = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Výchozí úspěšný stav pro authService a useCart
    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(useCart).mockReturnValue({ addToCart: mockAddToCart } as any)
  })

  it('zobrazí stav načítání', () => {
    // Podvrhneme hook tak, aby vrátil loading: true
    vi.mocked(useBookDetail).mockReturnValue({
      loading: true,
      error: null,
      book: null,
    } as any)

    render(<BookDetailPage />)
    expect(screen.getByText('Načítání detailů knihy...')).toBeInTheDocument()
  })

  it('zobrazí chybovou hlášku z API', () => {
    // Podvrhneme hook tak, aby vrátil chybu
    vi.mocked(useBookDetail).mockReturnValue({
      loading: false,
      error: 'Chyba připojení k serveru',
      book: null,
    } as any)

    render(<BookDetailPage />)
    expect(screen.getByText('Chyba připojení k serveru')).toBeInTheDocument()
  })

  it('zobrazí hlášku, pokud kniha neexistuje (bez specifické chyby)', () => {
    // Podvrhneme hook tak, aby nevrátil ani chybu, ani knihu
    vi.mocked(useBookDetail).mockReturnValue({
      loading: false,
      error: null,
      book: null,
    } as any)

    render(<BookDetailPage />)
    expect(screen.getByText('Kniha nebyla nalezena')).toBeInTheDocument()
  })

  it('zobrazí detail knihy a přidá ji do košíku', async () => {
    // Podvrhneme hook tak, aby vrátil úspěšně načtenou knihu
    const mockBook = { id: 1, title: 'Testovací Kniha' }
    vi.mocked(useBookDetail).mockReturnValue({
      loading: false,
      error: null,
      book: mockBook,
      comments: [],
      isFavourite: false,
      toggleFavourite: vi.fn(),
      addComment: vi.fn(),
    } as any)

    render(<BookDetailPage />)

    // Zkontrolujeme, že se vyrenderovaly mocknuté komponenty
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-comments')).toBeInTheDocument()

    // Otestujeme funkci handleAddToCart
    await user.click(screen.getByTestId('add-to-cart-btn'))

    // Ověříme, že se kniha poslala do košíku a ukázal se toast
    expect(mockAddToCart).toHaveBeenCalledWith(mockBook)
    expect(toast.success).toHaveBeenCalledWith('"Testovací Kniha" přidáno do košíku')
  })
})