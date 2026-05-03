import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useHomeStats } from './useHomeStats'
import { bookService } from '../services/api'
import api from '../services/api'

// --- MOCKY ---
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
  bookService: {
    getBooks: vi.fn(),
    getGenres: vi.fn(),
  },
}))

describe('useHomeStats', () => {
  const mockBooksResponse = {
    books: [
      { id: 1, title: 'Průměrná kniha', rating: 3 },
      { id: 2, title: 'Bestseller', rating: 5 },
    ],
    totalRecords: 150,
  }

  const mockGenres = ['Sci-fi', 'Fantasy', 'Drama']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('načte všechny statistiky úspěšně', async () => {
    // 1. Mockování volání getBooks (volá se 2x)
    vi.mocked(bookService.getBooks)
      .mockResolvedValueOnce({ books: [], totalRecords: 150 } as any) // První volání pro count
      .mockResolvedValueOnce(mockBooksResponse as any)               // Druhé volání pro bestseller

    // 2. Mockování žánrů
    vi.mocked(bookService.getGenres).mockResolvedValue(mockGenres as any)

    // 3. Mockování uživatelů přes defaultní api export
    vi.mocked(api.get).mockResolvedValue({ data: { count: 42 } })

    const { result } = renderHook(() => useHomeStats())

    // Ověření loading stavu
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Ověření výsledných hodnot
    expect(result.current.totalBooks).toBe(150)
    expect(result.current.totalGenres).toBe(3)
    expect(result.current.totalUsers).toBe(42)
    expect(result.current.bestseller?.title).toBe('Bestseller') // Ověření sortování
  })

  it('pokračuje v načítání, i když selže počet uživatelů (izolovaný try-catch)', async () => {
    vi.mocked(bookService.getBooks).mockResolvedValue({ books: [], totalRecords: 100 } as any)
    vi.mocked(bookService.getGenres).mockResolvedValue(['Genre1'] as any)
    
    // Simulace selhání pouze pro endpoint uživatelů
    vi.mocked(api.get).mockRejectedValueOnce(new Error('User API Down'))

    const { result } = renderHook(() => useHomeStats())

    await waitFor(() => expect(result.current.loading).toBe(false))

    // Ostatní data by měla být v pořádku
    expect(result.current.totalBooks).toBe(100)
    expect(result.current.totalGenres).toBe(1)
    // Uživatelé by měli mít fallback hodnotu 0 (nebo zůstat u výchozí)
    expect(result.current.totalUsers).toBe(0)
  })

  it('správně určí bestseller jako knihu s nejvyšším hodnocením', async () => {
    const mixedRatings = {
      books: [
        { id: 1, title: 'Nic moc', rating: 1 },
        { id: 2, title: 'Top', rating: 10 },
        { id: 3, title: 'Ujde', rating: 5 },
      ],
      totalRecords: 3
    }

    vi.mocked(bookService.getBooks)
      .mockResolvedValueOnce({ books: [], totalRecords: 3 } as any)
      .mockResolvedValueOnce(mixedRatings as any)
    
    vi.mocked(bookService.getGenres).mockResolvedValue([] as any)
    vi.mocked(api.get).mockResolvedValue({ data: { count: 0 } })

    const { result } = renderHook(() => useHomeStats())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.bestseller?.id).toBe(2)
    expect(result.current.bestseller?.title).toBe('Top')
  })

  it('ukončí loading i při totálním selhání hlavního try bloku', async () => {
    // Necháme hned první volání vyhodit chybu
    vi.mocked(bookService.getBooks).mockRejectedValueOnce(new Error('Fatal API Error'))

    const { result } = renderHook(() => useHomeStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Hodnoty zůstanou výchozí
    expect(result.current.totalBooks).toBe(0)
    expect(result.current.bestseller).toBeNull()
  })
})