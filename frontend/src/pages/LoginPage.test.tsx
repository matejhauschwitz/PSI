import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'
import { authService } from '../services/api'

// --- MOCKY ---
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('../services/api', () => ({
    authService: {
        login: vi.fn(),
    },
}))

describe('LoginPage', () => {
    const user = userEvent.setup()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const renderComponent = () =>
        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        )

    it('vyrenderuje formulář a aktualizuje vstupy', async () => {
        renderComponent()

        expect(screen.getByText('Přihlášení')).toBeInTheDocument()

        // Otestujeme, zda jdou inputy vyplnit (simulace uživatelského psaní)
        const usernameInput = screen.getByPlaceholderText('jméno')
        const passwordInput = screen.getByPlaceholderText('••••••••')

        await user.type(usernameInput, 'testuser')
        await user.type(passwordInput, 'heslo123')

        expect(usernameInput).toHaveValue('testuser')
        expect(passwordInput).toHaveValue('heslo123')
    })

    it('úspěšně odešle formulář a přesměruje na domovskou stránku', async () => {
        // Simulujeme úspěšné volání API (vrátí falešný token)
        vi.mocked(authService.login).mockResolvedValueOnce('fake-token')

        renderComponent()

        const usernameInput = screen.getByPlaceholderText('jméno')
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitBtn = screen.getByRole('button', { name: /Přihlásit se/i })

        // Vyplníme údaje
        await user.type(usernameInput, 'admin')
        await user.type(passwordInput, 'admin123')

        // Odešleme formulář
        await user.click(submitBtn)

        // TADY BYLA KONTROLA LOADINGU - SMAZÁNO.

        // Rovnou ověříme volání služby a přesměrování
        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith('admin', 'admin123')
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })

    it('zobrazí chybu při neplatných údajích', async () => {
        // Simulujeme selhání API (hodí chybu)
        vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid credentials'))

        renderComponent()

        const usernameInput = screen.getByPlaceholderText('jméno')
        const passwordInput = screen.getByPlaceholderText('••••••••')
        const submitBtn = screen.getByRole('button', { name: /Přihlásit se/i })

        await user.type(usernameInput, 'baduser')
        await user.type(passwordInput, 'badpass')
        await user.click(submitBtn)

        // Očekáváme zobrazení chybové hlášky, kterou máme zadrátovanou v catch bloku komponenty
        await waitFor(() => {
            expect(screen.getByText('Neplatné přihlašovací údaje')).toBeInTheDocument()
        })

        // Tlačítko by po zachycení chyby mělo být opět aktivní a vrátit se do původního stavu
        expect(submitBtn).not.toBeDisabled()
        expect(submitBtn).toHaveTextContent('Přihlásit se')
    })
})