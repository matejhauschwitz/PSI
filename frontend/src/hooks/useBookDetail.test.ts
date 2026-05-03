import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBookDetail } from './useBookDetail'
import { bookService, commentService } from '../services/api'

// --- MOCKY ---
vi.mock('react-router-dom', () => ({
  // Simulujeme, že jsme na URL /books/123
  useParams: () => ({ id: '123' }),
}))

vi.mock('../services/api', () => ({
  bookService: {
    getBook: vi.fn(),
    addFavourite: vi.fn(),
    removeFavourite: vi.fn(),
  },
  commentService: {
    getComments: vi.fn(),
    addComment: vi.fn(),
  },
}))

describe('useBookDetail', () => {
  const mockBook = { id: 123, title: 'Testovací Kniha', authors: 'Autor' }
  const mockComments = [{ id: 1, comment: 'Super!', rating: 5 }]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('úspěšně načte detaily knihy a komentáře při mountu', async () => {
    vi.mocked(bookService.getBook).mockResolvedValue(mockBook as any)
    vi.mocked(commentService.getComments).mockResolvedValue(mockComments as any)

    const { result } = renderHook(() => useBookDetail())

    // Počáteční stav
    expect(result.current.loading).toBe(true)

    // Počkání na vyřízení API volání
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.book).toEqual(mockBook)
    expect(result.current.comments).toEqual(mockComments)
    expect(result.current.error).toBeNull()
    expect(bookService.getBook).toHaveBeenCalledWith(123)
  })

  it('nastaví chybu, pokud se knihu nepodaří načíst', async () => {
    vi.mocked(bookService.getBook).mockRejectedValue(new Error('API Error'))
    vi.mocked(commentService.getComments).mockResolvedValue([])

    const { result } = renderHook(() => useBookDetail())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('Nepodařilo se načíst detaily knihy')
    expect(result.current.book).toBeNull()
  })

  it('toggleFavourite správně volá add/remove service', async () => {
    vi.mocked(bookService.getBook).mockResolvedValue(mockBook as any)
    vi.mocked(commentService.getComments).mockResolvedValue([])

    const { result } = renderHook(() => useBookDetail())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // 1. Přidání do oblíbených (výchozí stav isFavourite je false)
    await act(async () => {
      await result.current.toggleFavourite()
    })
    expect(bookService.addFavourite).toHaveBeenCalledWith(123)
    expect(result.current.isFavourite).toBe(true)

    // 2. Odebrání z oblíbených
    await act(async () => {
      await result.current.toggleFavourite()
    })
    expect(bookService.removeFavourite).toHaveBeenCalledWith(123)
    expect(result.current.isFavourite).toBe(false)
  })

  it('addComment odešle komentář a znovu načte seznam komentářů', async () => {
    vi.mocked(bookService.getBook).mockResolvedValue(mockBook as any)
    vi.mocked(commentService.getComments).mockResolvedValue(mockComments as any)
    vi.mocked(commentService.addComment).mockResolvedValue({} as any)

    const { result } = renderHook(() => useBookDetail())
    await waitFor(() => expect(result.current.loading).toBe(false))

    const newComment = { bookId: 123, comment: 'Nová recenze', rating: 4 }

    await act(async () => {
      const success = await result.current.addComment(newComment)
      expect(success).toBe(true)
    })

    // Ověření, že se zavolalo API pro přidání
    expect(commentService.addComment).toHaveBeenCalledWith(newComment)
    
    // Ověření, že se podruhé načetly komentáře (refresh seznamu)
    expect(commentService.getComments).toHaveBeenCalledTimes(2)
  })
})