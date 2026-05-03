import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FavouritesPage from './FavouritesPage'
import { useFavourites } from '../hooks/useFavourites'

// --- MOCKY ---

// Mock hooku
vi.mock('../hooks/useFavourites', () => ({
  useFavourites: vi.fn()
}))

// Mock gridu s testovacími tlačítky pro ověření prop callbacks
vi.mock('../components/FavouritesBooksGrid', () => ({
  default: ({ onRemove, onRetry }: any) => (
    <div data-testid="mock-favourites-grid">
      <button onClick={() => onRemove(123)}>Odebrat</button>
      <button onClick={onRetry}>Zkusit znovu</button>
    </div>
  )
}))

describe('FavouritesPage', () => {
  const user = userEvent.setup()
  const mockLoadFavourites = vi.fn()
  const mockHandleRemoveFavourite = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Defaultní návratová hodnota hooku
    vi.mocked(useFavourites).mockReturnValue({
      booksResponse: { page: 1, totalPages: 1, books: [] },
      loading: false,
      error: null,
      loadFavourites: mockLoadFavourites,
      handleRemoveFavourite: mockHandleRemoveFavourite,
    } as any)
  })

  it('vyrenderuje mřížku a předá do ní správně funkce', async () => {
    render(<FavouritesPage />)
    
    // Ověříme, že se komponenta vyrenderovala
    expect(screen.getByTestId('mock-favourites-grid')).toBeInTheDocument()

    // Odpálíme "onRemove"
    await user.click(screen.getByText('Odebrat'))
    expect(mockHandleRemoveFavourite).toHaveBeenCalledWith(123)

    // Odpálíme "onRetry"
    await user.click(screen.getByText('Zkusit znovu'))
    expect(mockLoadFavourites).toHaveBeenCalled()
  })
})