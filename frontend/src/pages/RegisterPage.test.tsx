import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import RegisterPage from './RegisterPage'
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
    register: vi.fn(),
  },
}))

describe('RegisterPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    )

  it('zobrazí chybu, pokud se hesla neshodují, a nevolá API', async () => {
    renderComponent()

    await user.type(screen.getByPlaceholderText('Vaše jméno'), 'Test')
    await user.type(screen.getByPlaceholderText('uživatelské jméno'), 'testuser')
    // Záměrně zadáme různá hesla
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'heslo123')
    await user.type(passwordInputs[1], 'heslojine')

    await user.click(screen.getByRole('button', { name: /Vytvořit účet/i }))

    expect(screen.getByText('Hesla se neshodují')).toBeInTheDocument()
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('úspěšně odešle formulář a přesměruje na login', async () => {
    vi.mocked(authService.register).mockResolvedValueOnce(undefined as any)

    renderComponent()

    await user.type(screen.getByPlaceholderText('Vaše jméno'), 'Jan Novák')
    await user.type(screen.getByPlaceholderText('vas@email.cz'), 'jan@novak.cz')
    await user.type(screen.getByPlaceholderText('uživatelské jméno'), 'jannovak')
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'tajneheslo')
    await user.type(passwordInputs[1], 'tajneheslo')

    await user.click(screen.getByRole('button', { name: /Vytvořit účet/i }))

    await waitFor(() => {
      // Zkontrolujeme payload, zda se odeslal bez confirmPassword
      expect(authService.register).toHaveBeenCalledWith({
        name: 'Jan Novák',
        email: 'jan@novak.cz',
        userName: 'jannovak',
        password: 'tajneheslo',
        favouriteGerners: [],
        confirmPassword: undefined
      })
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('zobrazí chybu při selhání API (např. uživatel existuje)', async () => {
    vi.mocked(authService.register).mockRejectedValueOnce(new Error('API Error'))

    renderComponent()

    await user.type(screen.getByPlaceholderText('Vaše jméno'), 'Test')
    await user.type(screen.getByPlaceholderText('uživatelské jméno'), 'testuser')
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••')
    await user.type(passwordInputs[0], 'tajneheslo')
    await user.type(passwordInputs[1], 'tajneheslo')

    await user.click(screen.getByRole('button', { name: /Vytvořit účet/i }))

    await waitFor(() => {
      expect(screen.getByText('Registrace se nezdařila. Zkuste jiné jméno.')).toBeInTheDocument()
    })
  })
})