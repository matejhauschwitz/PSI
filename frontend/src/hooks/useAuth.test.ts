import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'
import { authService, userService } from '../services/api'

// --- MOCKY ---
vi.mock('../services/api', () => ({
  authService: {
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  userService: {
    getUserDetail: vi.fn(),
  },
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Defaultní stav: není přihlášen
    vi.mocked(authService.isAuthenticated).mockReturnValue(false)
  })

  it('inicializuje se a skončí ve stavu loading: false', async () => {
    const { result } = renderHook(() => useAuth())

    // Místo okamžitého checku (který flakuje) čekáme na stabilní stav
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('načte roli uživatele, pokud je již přihlášen', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(userService.getUserDetail).mockResolvedValue({ role: 1 } as any)

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isAdmin).toBe(true)
      expect(result.current.userRole).toBe(1)
    })
  })

  it('nastaví roli 0, pokud getUserDetail selže', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(userService.getUserDetail).mockRejectedValue(new Error('Fail'))

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.userRole).toBe(0)
    })
  })

  it('login úspěšně aktualizuje stav', async () => {
    vi.mocked(authService.login).mockResolvedValue('token' as any)
    vi.mocked(userService.getUserDetail).mockResolvedValue({ role: 0 } as any)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Všechny asynchronní akce v hooku MUSÍ být v act
    await act(async () => {
      await result.current.login('user', 'pass')
    })

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.userRole).toBe(0)
    })
  })

  it('logout vyčistí stav', async () => {
    vi.mocked(authService.isAuthenticated).mockReturnValue(true)
    vi.mocked(userService.getUserDetail).mockResolvedValue({ role: 1 } as any)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    act(() => {
      result.current.logout()
    })

    // U synchronního logoutu můžeme rovnou kontrolovat
    expect(authService.logout).toHaveBeenCalled()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.userRole).toBe(null)
  })
})