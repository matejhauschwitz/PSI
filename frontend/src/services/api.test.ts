import { describe, it, expect, vi, beforeEach } from 'vitest'
import api, { authService, bookService, userService, commentService, orderService } from './api'

// --- MOCKY ---
// Globální mock pro axios, abychom zamezili reálným síťovým voláním
vi.mock('axios', () => {
    const mockInstance = {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
        },
    }
    return {
        default: {
            create: vi.fn(() => mockInstance),
        },
    }
})

// Pomocné proměnné pro snazší testování bez TypeScript errorů
const mockedGet = api.get as any
const mockedPost = api.post as any
const mockedDelete = api.delete as any

describe('api.ts - Services', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear() // Vyčistíme localStorage před každým testem
    })

    describe('authService', () => {
        it('register - odešle data o uživateli', async () => {
            mockedPost.mockResolvedValueOnce({ data: 'ok' })
            const user = { name: 'P', userName: 'p', email: 'p@p.cz', password: '123', favouriteGerners: [] }

            await authService.register(user as any)
            expect(mockedPost).toHaveBeenCalledWith('/auth/register', user)
        })

        it('login - zavolá API a uloží token do localStorage', async () => {
            mockedPost.mockResolvedValueOnce({ data: 'fake-jwt-token' })

            const token = await authService.login('admin', 'password')

            expect(mockedPost).toHaveBeenCalledWith('/auth/login', { userName: 'admin', password: 'password' })
            expect(token).toBe('fake-jwt-token')
            expect(localStorage.getItem('jwt_token')).toBe('fake-jwt-token')
        })

        it('logout - odstraní token z localStorage', () => {
            localStorage.setItem('jwt_token', 'token')
            authService.logout()
            expect(localStorage.getItem('jwt_token')).toBeNull()
        })

        it('isAuthenticated - správně vyhodnotí přítomnost tokenu', () => {
            expect(authService.isAuthenticated()).toBe(false)

            localStorage.setItem('jwt_token', 'token')
            expect(authService.isAuthenticated()).toBe(true)
        })
    })

    describe('bookService', () => {
        it('getBooks - zformátuje parametry, pokud jsou všechny předané', async () => {
            mockedGet.mockResolvedValueOnce({ data: { books: [] } })

            // Vyzkoušíme i 0 jako minPrice (musí projít podmínkou !== undefined)
            await bookService.getBooks(2, 20, 'Harry', 'Fantasy', 0, 500)

            expect(mockedGet).toHaveBeenCalledWith('/books', {
                params: { page: 2, pageSize: 20, title: 'Harry', genre: 'Fantasy', minPrice: 0, maxPrice: 500 }
            })
        })

        it('getBooks - nepošle volitelné parametry, pokud chybí', async () => {
            mockedGet.mockResolvedValueOnce({ data: { books: [] } })
            await bookService.getBooks() // Zavolá se s výchozími (page 1, pageSize 10)

            expect(mockedGet).toHaveBeenCalledWith('/books', {
                params: { page: 1, pageSize: 10 }
            })
        })

        it('getGenres - vrátí pole žánrů', async () => {
            mockedGet.mockResolvedValueOnce({ data: ['Sci-Fi', 'Fantasy'] })
            const res = await bookService.getGenres()
            expect(res).toEqual(['Sci-Fi', 'Fantasy'])
        })

        it('getBook - vrátí detail knihy', async () => {
            mockedGet.mockResolvedValueOnce({ data: { id: 1, title: 'Kniha' } })
            const res = await bookService.getBook(1)
            expect(res).toEqual({ id: 1, title: 'Kniha' })
        })

        it('getFavourites, addFavourite, removeFavourite - volají správné endpointy', async () => {
            mockedGet.mockResolvedValueOnce({ data: [] })
            await bookService.getFavourites(1, 10)
            expect(mockedGet).toHaveBeenCalledWith('/books/favourites', { params: { page: 1, pageSize: 10 } })

            mockedPost.mockResolvedValueOnce({})
            await bookService.addFavourite(99)
            expect(mockedPost).toHaveBeenCalledWith('/books/favourites/99')

            mockedDelete.mockResolvedValueOnce({})
            await bookService.removeFavourite(99)
            expect(mockedDelete).toHaveBeenCalledWith('/books/favourites/99')
        })
    })

    describe('userService', () => {
        it('getUserDetail - vrátí profil uživatele', async () => {
            mockedGet.mockResolvedValueOnce({ data: { name: 'Pepa' } })
            const res = await userService.getUserDetail()
            expect(res).toEqual({ name: 'Pepa' })
        })

        it('updateUser - pošle data uživatele k updatu', async () => {
            mockedPost.mockResolvedValueOnce({})
            await userService.updateUser({ name: 'Nová verze' })
            expect(mockedPost).toHaveBeenCalledWith('/user/update', { name: 'Nová verze' })
        })
    })

    describe('commentService', () => {
        const comment = { bookId: 1, comment: 'Super', rating: 5 }

        it('addComment - hodí chybu, pokud chybí token', async () => {
            // V localStorage není token
            await expect(commentService.addComment(comment as any)).rejects.toThrow('Nejste přihlášeni')
        })

        it('addComment - odešle payload včetně autorizační hlavičky', async () => {
            localStorage.setItem('jwt_token', 'token123')
            mockedPost.mockResolvedValueOnce({ data: 'ok' })

            await commentService.addComment(comment as any)

            expect(mockedPost).toHaveBeenCalledWith(
                '/comments/comment',
                { bookId: 1, content: 'Super', rating: 5 },
                { headers: { Authorization: 'Bearer token123' } }
            )
        })

        it('addComment - vytáhne error z response.data.message (standard backend error)', async () => {
            localStorage.setItem('jwt_token', 'token123')
            mockedPost.mockRejectedValueOnce({
                response: { data: { message: 'Nelze hodnotit dvakrát' } }
            })
            await expect(commentService.addComment(comment as any)).rejects.toThrow('Nelze hodnotit dvakrát')
        })

        it('addComment - použije JSON.stringify, pokud API vrátí neznámý objekt', async () => {
            localStorage.setItem('jwt_token', 'token123')
            mockedPost.mockRejectedValueOnce({
                response: { data: { code: 500, detail: 'Server crash' } }
            })
            // Očekáváme, že si funkce objekt zformátuje do stringu
            await expect(commentService.addComment(comment as any)).rejects.toThrow('{"code":500,"detail":"Server crash"}')
        })

        it('getComments - vrátí data při úspěchu', async () => {
            mockedGet.mockResolvedValueOnce({ data: [{ id: 1, content: 'Test' }] })
            const res = await commentService.getComments(1)
            expect(res).toEqual([{ id: 1, content: 'Test' }])
        })

        it('getComments - zachytí chybu API a tiše vrátí prázdné pole', async () => {
            mockedGet.mockRejectedValueOnce(new Error('Network error'))
            const res = await commentService.getComments(1)
            expect(res).toEqual([])
        })
    })

    describe('orderService', () => {
        it('createOrder - namapuje a odešle objednávku jako camelCase', async () => {
            mockedPost.mockResolvedValueOnce({})
            await orderService.createOrder({ bookIds: [1, 2], paymentMethod: 'Card' } as any)
            expect(mockedPost).toHaveBeenCalledWith('/order/order', {
                bookIds: [1, 2],
                paymentMethod: 'Card'
            })
        })

        it('getOrders - správně transformuje objekty (z backendových DTO na lokální state)', async () => {
            mockedGet.mockResolvedValueOnce({
                data: [
                    // 1. Kompletní objednávka
                    {
                        id: 1,
                        userId: 'user1',
                        books: [{ id: 10 }, { id: 20 }],
                        status: 'Completed',
                        paymentMethod: 'OnlineCard',
                        totalPrice: 500,
                        created: '2026-05-01T10:00:00Z'
                    },
                    // 2. Nekompletní objednávka (vyzkoušíme fallbacky)
                    {
                        id: 2,
                        // Chybí books, status a created
                    }
                ]
            })

            const res = await orderService.getOrders()

            // Test plné objednávky
            expect(res[0]).toMatchObject({
                id: 1,
                books: [{ id: 10 }, { id: 20 }],
                bookIds: [10, 20], // Zkontroluje namapování pole ID
                status: 'Completed',
                paymentMethod: 'OnlineCard',
                createdAt: expect.stringContaining('2026')
            })

            // Test objednávky plné prázdných hodnot (fallbacky)
            expect(res[1]).toMatchObject({
                id: 2,
                books: [],
                bookIds: [],
                status: 'Unknown',
                createdAt: expect.any(String) // Fallback by měl vytvořit aktuální datum
            })
        })
    })
})