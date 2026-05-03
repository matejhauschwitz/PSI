import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBooksFilter } from './useBooksFilter'
import { bookService } from '../services/api'

// --- MOCKY ---
vi.mock('../services/api', () => ({
    bookService: {
        getBooks: vi.fn(),
        getGenres: vi.fn(),
    },
}))

describe('useBooksFilter', () => {
    const mockResponse = { books: [{ id: 1, title: 'Test' }], totalCount: 1, totalPages: 1 }
    const mockGenres = ['Sci-Fi', 'Fantasy']

    beforeEach(() => {
        vi.clearAllMocks()
        // Výchozí úspěšné mocky
        vi.mocked(bookService.getBooks).mockResolvedValue(mockResponse as any)
        vi.mocked(bookService.getGenres).mockResolvedValue(mockGenres as any)
    })

    it('načte žánry a knihy při inicializaci', async () => {
        const { result } = renderHook(() => useBooksFilter())

        expect(result.current.loading).toBe(true)

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(result.current.genres).toEqual(mockGenres)
            expect(result.current.booksResponse).toEqual(mockResponse)
        })

        expect(bookService.getBooks).toHaveBeenCalledWith(1, 20, '', '', undefined, undefined)
    })

    it('změna stránky vyvolá nové načtení knih', async () => {
        const { result } = renderHook(() => useBooksFilter())
        await waitFor(() => expect(result.current.loading).toBe(false))

        await act(async () => {
            result.current.setPage(2)
        })

        expect(bookService.getBooks).toHaveBeenLastCalledWith(2, 20, '', '', undefined, undefined)
    })

    it('handleGenreChange změní žánr a resetuje stránku na 1', async () => {
        const { result } = renderHook(() => useBooksFilter())
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Simulujeme, že jsme na straně 5
        await act(async () => {
            result.current.setPage(5)
        })

        await act(async () => {
            result.current.handleGenreChange('Sci-Fi')
        })

        expect(result.current.genre).toBe('Sci-Fi')
        expect(result.current.page).toBe(1)
        expect(bookService.getBooks).toHaveBeenLastCalledWith(1, 20, '', 'Sci-Fi', undefined, undefined)
    })

    it('handleSearch a handlePriceBlur resetují stránku a volají loadBooks', async () => {
        const { result } = renderHook(() => useBooksFilter())
        await waitFor(() => expect(result.current.loading).toBe(false))

        // Nastavíme filtry
        await act(async () => {
            result.current.setTitle('Zaklínač')
            result.current.setMinPrice('100')
            result.current.setMaxPrice('500')
        })

        await act(async () => {
            result.current.handleSearch()
        })

        expect(bookService.getBooks).toHaveBeenLastCalledWith(1, 20, 'Zaklínač', '', 100, 500)

        await act(async () => {
            result.current.handlePriceBlur()
        })

        // Celkem 3x: Init (1), handleSearch (2), handlePriceBlur (3)
        expect(bookService.getBooks).toHaveBeenCalledTimes(3)
    })

    it('clearFilters resetuje všechny stavy na výchozí', async () => {
        const { result } = renderHook(() => useBooksFilter())
        await waitFor(() => expect(result.current.loading).toBe(false))

        await act(async () => {
            result.current.setTitle('A')
            result.current.setGenre('B')
            result.current.setMinPrice('10')
            result.current.setPage(2)
        })

        expect(result.current.hasActiveFilters).toBe(true)

        await act(async () => {
            result.current.clearFilters()
        })

        expect(result.current.title).toBe('')
        expect(result.current.genre).toBe('')
        expect(result.current.minPrice).toBe('')
        expect(result.current.page).toBe(1)
        expect(result.current.hasActiveFilters).toBe(false)
    })

    it('správně zpracuje chybu při načítání knih', async () => {
        vi.mocked(bookService.getBooks).mockRejectedValueOnce(new Error('Chyba serveru'))

        const { result } = renderHook(() => useBooksFilter())

        await waitFor(() => {
            expect(result.current.error).toBe('Nepodařilo se načíst knihy')
            expect(result.current.loading).toBe(false)
        })
    })
})