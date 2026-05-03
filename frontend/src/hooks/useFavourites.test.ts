import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFavourites } from './useFavourites'
import { bookService } from '../services/api'

// --- MOCKY ---
vi.mock('../services/api', () => ({
    bookService: {
        getFavourites: vi.fn(),
        removeFavourite: vi.fn(),
    },
}))

describe('useFavourites', () => {
    const mockResponse = {
        books: [
            { id: 1, title: 'Kniha 1' },
            { id: 2, title: 'Kniha 2' },
        ],
        totalRecords: 2,
        totalPages: 1,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        // Defaultní chování - úspěch
        vi.mocked(bookService.getFavourites).mockResolvedValue(mockResponse as any)
        vi.mocked(bookService.removeFavourite).mockResolvedValue({} as any)
    })

    it('načte oblíbené knihy při inicializaci', async () => {
        const { result } = renderHook(() => useFavourites())

        expect(result.current.loading).toBe(true)

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(result.current.booksResponse).toEqual(mockResponse)
        })

        expect(bookService.getFavourites).toHaveBeenCalledWith(1, 20)
    })

    it('optimisticky odebere knihu ze seznamu', async () => {
        const { result } = renderHook(() => useFavourites())
        await waitFor(() => expect(result.current.loading).toBe(false))

        let resolveApi: any
        const apiPromise = new Promise((resolve) => { resolveApi = resolve })
        vi.mocked(bookService.removeFavourite).mockReturnValue(apiPromise as any)

        await act(async () => {
            result.current.handleRemoveFavourite(1)
        })

        // UI se změní okamžitě (optimisticky)
        expect(result.current.booksResponse?.books).toHaveLength(1)
        expect(result.current.booksResponse?.totalRecords).toBe(1)

        await act(async () => {
            resolveApi({})
        })
    })

    it('správně zpracuje chybu při úvodním načítání', async () => {
        vi.mocked(bookService.getFavourites).mockRejectedValueOnce(new Error('Server Down'))

        const { result } = renderHook(() => useFavourites())

        await waitFor(() => {
            expect(result.current.loading).toBe(false)
            expect(result.current.error).toBe('Nepodařilo se načíst oblíbené knihy')
        })
    })
})