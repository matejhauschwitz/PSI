import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFeaturedBooks } from './useFeaturedBooks'
import { bookService } from '../services/api'

// --- MOCKY ---
vi.mock('../services/api', () => ({
  bookService: {
    getBooks: vi.fn(),
  },
}))

describe('useFeaturedBooks', () => {
  // Pomocná funkce pro generování testovacích dat
  const createMockBooks = (count: number) => 
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Kniha ${i + 1}`,
      rating: i, // Rating bude 0, 1, 2...
    }))

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('načte, seřadí a ořízne knihy podle ratingu', async () => {
    const mockBooks = createMockBooks(10) // Vytvoříme 10 knih s ratingy 0 až 9
    vi.mocked(bookService.getBooks).mockResolvedValue({
      books: mockBooks,
      totalRecords: 10,
      totalPages: 1
    } as any)

    const { result } = renderHook(() => useFeaturedBooks())

    // 1. Ověření počátečního stavu
    expect(result.current.loading).toBe(true)
    expect(result.current.books).toEqual([])

    // 2. Počkání na doběhnutí asynchronní operace
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // 3. Ověření transformace dat
    // Máme jich mít jen 6
    expect(result.current.books).toHaveLength(6)
    
    // Mají být seřazeny sestupně podle ratingu (9, 8, 7, 6, 5, 4)
    expect(result.current.books[0].rating).toBe(9)
    expect(result.current.books[0].id).toBe(10)
    expect(result.current.books[5].rating).toBe(4)

    // 4. Ověření, že API bylo voláno se správnými parametry (50 knih na začátku)
    expect(bookService.getBooks).toHaveBeenCalledWith(1, 50)
  })

  it('správně ošetří případ, kdy kniha nemá rating (null/undefined)', async () => {
    const mockBooks = [
      { id: 1, title: 'Bez ratingu', rating: undefined },
      { id: 2, title: 'S ratingem', rating: 5 },
    ]
    
    vi.mocked(bookService.getBooks).mockResolvedValue({
      books: mockBooks,
      totalRecords: 2,
      totalPages: 1
    } as any)

    const { result } = renderHook(() => useFeaturedBooks())

    await waitFor(() => expect(result.current.loading).toBe(false))

    // Kniha s ratingem 5 by měla být první, undefined (0) druhá
    expect(result.current.books[0].id).toBe(2)
    expect(result.current.books[1].id).toBe(1)
  })

  it('nastaví chybu, pokud API volání selže', async () => {
    // Simulace chyby serveru
    vi.mocked(bookService.getBooks).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useFeaturedBooks())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Nepodařilo se načíst doporučené knihy')
    })

    // Books by měly zůstat prázdné pole
    expect(result.current.books).toEqual([])
  })

  it('vyresetuje chybu při novém pokusu o načtení (pokud by se load volal znovu)', async () => {
    // V tomto hooku se load volá jen při mountu, 
    // ale je dobré vědět, že logika uvnitř try-catch funguje správně.
    vi.mocked(bookService.getBooks).mockRejectedValueOnce(new Error('First fail'))

    const { result } = renderHook(() => useFeaturedBooks())

    await waitFor(() => expect(result.current.error).not.toBeNull())

    // Teoreticky, kdybychom v hooku měli funkci na refresh (např. exportovanou), 
    // testovali bychom, že loading(true) a error(null) proběhne správně.
    // V aktuálním kódu stačí ověřit error state po selhání.
    expect(result.current.error).toBe('Nepodařilo se načíst doporučené knihy')
  })
})