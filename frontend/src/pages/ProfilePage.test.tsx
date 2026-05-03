import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfilePage from './ProfilePage'
import { userService, bookService, orderService } from '../services/api'

// --- MOCKY SLUŽEB ---
vi.mock('../services/api', () => ({
    userService: {
        getUserDetail: vi.fn(),
        updateUser: vi.fn(),
    },
    bookService: {
        getGenres: vi.fn(),
    },
    orderService: {
        getOrders: vi.fn(),
    },
}))

// --- MOCKY KOMPONENT ---
// Přidali jsme type="button", aby kliknutí neodesílala formulář!
vi.mock('../components/ProfileHeader', () => ({
    default: () => <div data-testid="mock-profile-header" />
}))

vi.mock('../components/ProfileFormHeader', () => ({
    default: ({ onNameChange, onEmailChange, onGenderChange, onBirthdayChange, onProcessDataChange }: any) => (
        <div data-testid="mock-profile-form-header">
            <button type="button" onClick={() => onNameChange('Nový Pepa')}>Změnit jméno</button>
            <button type="button" onClick={() => onEmailChange('pepa@pepa.cz')}>Změnit email</button>
            <button type="button" onClick={() => onGenderChange('female')}>Změnit pohlaví</button>
            <button type="button" onClick={() => onBirthdayChange('2000-01-01')}>Změnit narozeniny</button>
            <button type="button" onClick={() => onProcessDataChange(true)}>Souhlasit</button>
        </div>
    )
}))

vi.mock('../components/AddressSection', () => ({
    default: ({ title, onChange }: any) => (
        <div data-testid={`mock-address-section-${title}`}>
            <button type="button" onClick={() => onChange('streetAddress', 'Nová Ulice 1')}>
                Změnit ulici pro {title}
            </button>
        </div>
    )
}))

vi.mock('../components/GenreSelector', () => ({
    default: ({ onToggle }: any) => (
        <div data-testid="mock-genre-selector">
            <button type="button" onClick={() => onToggle('Sci-Fi')}>Přepnout Sci-Fi</button>
        </div>
    )
}))

describe('ProfilePage', () => {
    const user = userEvent.setup()

    // Defaultní validní user
    const mockValidUser = {
        name: 'Pepa',
        email: 'test@test.cz',
        isMale: true,
        birthDay: '1990-01-01',
        processData: true,
        address: { streetAddress: 'Testovací 1' },
        billingAddress: { streetAddress: 'Testovací 2' },
        favouriteGerners: ['Fantasy']
    }

    // Nevalidní user pro test varování
    const mockInvalidUser = {
        name: 'Pepa'
        // Chybí adresa, pohlaví atd.
    }

    beforeEach(() => {
        vi.clearAllMocks()

        // Výchozí úspěšné odpovědi API
        vi.mocked(userService.getUserDetail).mockResolvedValue(mockValidUser as any)
        vi.mocked(bookService.getGenres).mockResolvedValue(['Sci-Fi', 'Fantasy'])
        vi.mocked(orderService.getOrders).mockResolvedValue([
            { id: 1, status: 'Completed', totalPrice: 500, createdAt: '2026-05-01' },
            { id: 2, status: 'Pending', totalPrice: 100, bookIds: [1] },
            { id: 3, status: 'Unknown', totalPrice: 200 }
        ] as any)
        vi.mocked(userService.updateUser).mockResolvedValue({} as any)
    })

    it('zobrazí loading stav na začátku', () => {
        // API se nevyřeší hned
        vi.mocked(userService.getUserDetail).mockImplementation(() => new Promise(() => { }))
        render(<ProfilePage />)
        expect(screen.getByText('Načítám profil...')).toBeInTheDocument()
    })

    it('zobrazí chybu, pokud selže načtení profilu', async () => {
        vi.mocked(userService.getUserDetail).mockRejectedValueOnce(new Error('Chyba'))
        render(<ProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('Nepodařilo se načíst profil')).toBeInTheDocument()
            expect(screen.queryByTestId('mock-profile-header')).not.toBeInTheDocument()
        })
    })

    it('zobrazí varování o chybějících údajích (getMissingCheckoutData)', async () => {
        vi.mocked(userService.getUserDetail).mockResolvedValueOnce(mockInvalidUser as any)
        render(<ProfilePage />)

        await waitFor(() => {
            expect(screen.getByText(/Pro nákup je potřeba vyplnit:/)).toBeInTheDocument()
            // Zkontrolujeme, že vypsal správně ty chybějící
            expect(screen.getByText(/domovní adresa, fakturační adresa, pohlaví, datum narození, souhlas se zpracováním dat/)).toBeInTheDocument()
        })
    })

    it('správně propíše data do komponent a změní stav při interakci (onChange)', async () => {
        render(<ProfilePage />)

        await waitFor(() => screen.getByTestId('mock-profile-header'))

        // Změna osobních údajů přes mockovaný header
        await user.click(screen.getByText('Změnit jméno'))
        await user.click(screen.getByText('Změnit email'))
        await user.click(screen.getByText('Změnit pohlaví'))
        await user.click(screen.getByText('Změnit narozeniny'))
        await user.click(screen.getByText('Souhlasit'))

        // Změna adresy (Adresa doručení vs Fakturační)
        await user.click(screen.getByText('Změnit ulici pro Adresa doručení'))
        await user.click(screen.getByText('Změnit ulici pro Fakturační adresa'))

        // Změna žánrů (toggle Sci-Fi)
        await user.click(screen.getByText('Přepnout Sci-Fi'))

        // Odpálíme save, abychom viděli s čím se API zavolalo
        await user.click(screen.getByRole('button', { name: /Uložit změny/i }))

        await waitFor(() => {
            // userService.updateUser by měl být zavolán s upraveným objektem uživatele
            const updatedUser = vi.mocked(userService.updateUser).mock.calls[0][0]
            expect(updatedUser.name).toBe('Nový Pepa')
            expect(updatedUser.email).toBe('pepa@pepa.cz')
            expect(updatedUser.isMale).toBe(false)
            expect(updatedUser.birthDay).toBe('2000-01-01')
            expect(updatedUser.processData).toBe(true)
            expect(updatedUser.address?.streetAddress).toBe('Nová Ulice 1')
            expect(updatedUser.billingAddress?.streetAddress).toBe('Nová Ulice 1')
            // Původně měl Fantasy, my jsme přidali Sci-Fi
            expect(updatedUser.favouriteGerners).toEqual(['Fantasy', 'Sci-Fi'])

            // Objeví se success hláška
            expect(screen.getByText('Profil byl úspěšně uložen!')).toBeInTheDocument()
        })
    })

    it('odstraní žánr při druhém toggle kliknutí', async () => {
        // Přednastavíme uživatele s žánrem Sci-Fi
        vi.mocked(userService.getUserDetail).mockResolvedValueOnce({ ...mockValidUser, favouriteGerners: ['Sci-Fi'] } as any)
        render(<ProfilePage />)

        await waitFor(() => screen.getByTestId('mock-genre-selector'))

        // Klikneme na přepnutí (mělo by to žánr smazat)
        await user.click(screen.getByText('Přepnout Sci-Fi'))

        // Uložíme
        await user.click(screen.getByRole('button', { name: /Uložit změny/i }))

        await waitFor(() => {
            const updatedUser = vi.mocked(userService.updateUser).mock.calls[0][0]
            expect(updatedUser.favouriteGerners).toEqual([]) // Pole je teď prázdné
        })
    })

    it('zobrazí chybu při ukládání', async () => {
        render(<ProfilePage />)
        await waitFor(() => screen.getByTestId('mock-profile-header'))

        // Nasimulujeme chybu z API s chybovým message z backendu
        vi.mocked(userService.updateUser).mockRejectedValueOnce({
            response: { data: { message: 'Neplatný email formát' } }
        })

        await user.click(screen.getByRole('button', { name: /Uložit změny/i }))

        await waitFor(() => {
            expect(screen.getByText('Neplatný email formát')).toBeInTheDocument()
        })
    })

    it('vykreslí objednávky a jejich stavy', async () => {
        render(<ProfilePage />)

        await waitFor(() => {
            // API vrací 3 mock objednávky (id 1, 2, 3), zkontrolujeme jestli tam jsou a jak se vypsaly statusy
            expect(screen.getByText('Objednávka #1')).toBeInTheDocument()
            expect(screen.getByText('Dokončeno')).toBeInTheDocument()

            expect(screen.getByText('Objednávka #2')).toBeInTheDocument()
            expect(screen.getByText('Čekající')).toBeInTheDocument()

            expect(screen.getByText('Objednávka #3')).toBeInTheDocument()
            // TADY BYLA CHYBA: hledali jsme "Unknown", ale v UI se ukazuje "Neznámý"
            expect(screen.getByText('Neznámý')).toBeInTheDocument()
        })
    })

    it('zobrazí prázdnou sekci, pokud nemá objednávky', async () => {
        vi.mocked(orderService.getOrders).mockResolvedValueOnce([])
        render(<ProfilePage />)

        await waitFor(() => {
            expect(screen.getByText('Zatím žádné objednávky')).toBeInTheDocument()
        })
    })
})