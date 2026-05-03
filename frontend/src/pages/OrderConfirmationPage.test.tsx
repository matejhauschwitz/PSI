import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import OrderConfirmationPage from './OrderConfirmationPage'
import { orderService } from '../services/api'

// --- MOCKY ---
vi.mock('../services/api', () => ({
    orderService: {
        getOrders: vi.fn(),
    },
}))

describe('OrderConfirmationPage', () => {
    const user = userEvent.setup()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    // Pomocná funkce pro vyrenderování komponenty s konkrétním React Router statem
    const renderWithRouter = (initialEntries: any[] = ['/order/1']) => {
        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    {/* Stránka pro potvrzení objednávky */}
                    <Route path="/order/:orderId" element={<OrderConfirmationPage />} />
                    {/* Cíle přesměrování (jen jako text, aby test nepadal) */}
                    <Route path="/books" element={<div>Stránka Knihy</div>} />
                    <Route path="/profile" element={<div>Stránka Profil</div>} />
                </Routes>
            </MemoryRouter>
        )
    }

    it('zobrazí načítání', () => {
        // API nevrátí hned, takže se ukáže loading
        vi.mocked(orderService.getOrders).mockImplementation(() => new Promise(() => { }))
        renderWithRouter()
        expect(screen.getByText('Načítání potvrzení objednávky...')).toBeInTheDocument()
    })

    it('zobrazí chybu a umožní přechod na knihy, pokud objednávka neexistuje', async () => {
        // API vrátí prázdné pole nebo selže
        vi.mocked(orderService.getOrders).mockResolvedValueOnce([])

        renderWithRouter()

        await waitFor(() => {
            expect(screen.getByText('Objednávka se nepodařila načíst')).toBeInTheDocument()
        })

        // Klik na tlačítko "Zpět na knihy"
        await user.click(screen.getByRole('button', { name: 'Zpět na knihy' }))
        expect(screen.getByText('Stránka Knihy')).toBeInTheDocument()
    })

    it('načte objednávku z location.state (bez volání API)', async () => {
        // Simulujeme navigaci s přibaleným objektem (tak to funguje např. po úspěšném košíku)
        const mockStateOrder = {
            id: 999,
            totalPrice: 1500,
            paymentMethod: '1',
            bookIds: [1, 2],
        }

        renderWithRouter([{ pathname: '/order/1', state: { order: mockStateOrder } }])

        await waitFor(() => {
            // getOrders by se vůbec nemělo zavolat, protože máme data ze state
            expect(orderService.getOrders).not.toHaveBeenCalled()

            // Zkontrolujeme, že se vyrenderovalo ID
            expect(screen.getByText(/#999/)).toBeInTheDocument()

            // Zkontrolujeme mapování metody "1" -> 📦 Platba při Doručení
            expect(screen.getByText('📦 Platba při Doručení')).toBeInTheDocument()
        })
    })

    it('načte objednávku z backendu jako fallback', async () => {
        // API vrátí pole objednávek (komponenta má vzít tu poslední)
        const mockApiOrders = [
            { id: 101, totalPrice: 500, paymentMethod: 'Transfer', bookIds: [5] },
            { id: 102, totalPrice: 1000, paymentMethod: 'OnlineCard', bookIds: [3, 4] },
        ]
        vi.mocked(orderService.getOrders).mockResolvedValueOnce(mockApiOrders as any)

        // Render bez state
        renderWithRouter()

        await waitFor(() => {
            expect(orderService.getOrders).toHaveBeenCalled()

            // Má se zobrazit ta poslední (ID 102)
            expect(screen.getByText(/#102/)).toBeInTheDocument()

            // Zkontrolujeme mapování textu -> 💳 Karta (Online)
            expect(screen.getByText('💳 Karta (Online)')).toBeInTheDocument()

            // Zkontrolujeme zobrazení celkové ceny
            expect(screen.getByText('1000.00 Kč')).toBeInTheDocument()
        })
    })

    it('fungují tlačítka pro navigaci po úspěšném načtení', async () => {
        const mockStateOrder = { id: 777 }
        renderWithRouter([{ pathname: '/order/1', state: { order: mockStateOrder } }])

        await waitFor(() => screen.getByText(/#777/))

        // Jít do profilu
        await user.click(screen.getByRole('button', { name: /Jít do Profilu/i }))
        expect(screen.getByText('Stránka Profil')).toBeInTheDocument()

        // Vrátíme se zpět (simulace) a zkusíme druhé tlačítko
        renderWithRouter([{ pathname: '/order/1', state: { order: mockStateOrder } }])
        await waitFor(() => screen.getByText(/#777/))

        await user.click(screen.getByRole('button', { name: 'Pokračovat v Nákupu' }))
        expect(screen.getByText('Stránka Knihy')).toBeInTheDocument()
    })
})