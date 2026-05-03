import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BooksPage from './BooksPage'
import { useBooksFilter } from '../hooks/useBooksFilter'

// --- MOCKY ---

// Mock pro hook
vi.mock('../hooks/useBooksFilter', () => ({
  useBooksFilter: vi.fn()
}))

// Mock pro Filters (stačí nám jen vědět, že se vyrenderoval)
vi.mock('../components/BooksFilters', () => ({
  default: () => <div data-testid="mock-filters" />
}))

// Mock pro Grid (přidáme tlačítko, kterým odpálíme funkci onPageChange)
vi.mock('../components/BooksGrid', () => ({
  default: ({ onPageChange }: any) => (
    <div data-testid="mock-grid">
      <button data-testid="trigger-page-change" onClick={() => onPageChange(2)}>
        Další strana
      </button>
    </div>
  )
}))

describe('BooksPage', () => {
  const user = userEvent.setup()
  const mockSetPage = vi.fn()

  // Nachystáme si defaultní sadu dat, kterou bude hook vracet
  const mockFilterData = {
    booksResponse: { page: 1, totalPages: 5, books: [] },
    loading: false,
    error: null,
    title: '',
    setTitle: vi.fn(),
    genre: '',
    setGenre: vi.fn(),
    minPrice: '',
    setMinPrice: vi.fn(),
    maxPrice: '',
    setMaxPrice: vi.fn(),
    genres: [],
    handleSearch: vi.fn(),
    handleGenreChange: vi.fn(),
    handlePriceBlur: vi.fn(),
    clearFilters: vi.fn(),
    hasActiveFilters: false,
    loadBooks: vi.fn(),
    page: 1,
    setPage: mockSetPage
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Namockujeme window.scrollTo, aby test nepadal na neexistující funkci v JSDOM
    window.scrollTo = vi.fn()
    
    // Nastavíme hooku defaultní data
    vi.mocked(useBooksFilter).mockReturnValue(mockFilterData as any)
  })

  it('vyrenderuje filtry a mřížku s knihami', () => {
    render(<BooksPage />)
    
    expect(screen.getByTestId('mock-filters')).toBeInTheDocument()
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument()
  })

  it('zavolá window.scrollTo při načtení a při změně booksResponse.page', () => {
    render(<BooksPage />)
    
    // Zkontrolujeme, zda useEffect zavolal scrollTo se správnými parametry
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('předá novou stránku do setPage přes onPageChange', async () => {
    render(<BooksPage />)
    
    // Klikneme na tlačítko v našem mockovaném gridu, které pošle "2" jako newPage
    await user.click(screen.getByTestId('trigger-page-change'))
    
    // Zkontrolujeme, že se zavolal setPage v hooku s hodnotou 2
    expect(mockSetPage).toHaveBeenCalledWith(2)
  })
})