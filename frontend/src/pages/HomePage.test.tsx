import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HomePage from './HomePage'
import { useFeaturedBooks } from '../hooks/useFeaturedBooks'
import { useHomeStats } from '../hooks/useHomeStats'

// --- MOCKY ---

// Mock hooků
vi.mock('../hooks/useFeaturedBooks', () => ({
  useFeaturedBooks: vi.fn()
}))

vi.mock('../hooks/useHomeStats', () => ({
  useHomeStats: vi.fn()
}))

// Mock komponent – vypíšeme si z nich props jako text, abychom mohli snadno otestovat,
// že hooky správně předaly data dovnitř.
vi.mock('../components/HeroBanner', () => ({
  default: ({ bestseller, loading }: any) => (
    <div data-testid="mock-hero">
      Bestseller: {bestseller?.title} | Loading: {String(loading)}
    </div>
  )
}))

vi.mock('../components/StatsBanner', () => ({
  default: ({ totalBooks, totalGenres, totalUsers, loading }: any) => (
    <div data-testid="mock-stats">
      Books: {totalBooks} | Genres: {totalGenres} | Users: {totalUsers} | Loading: {String(loading)}
    </div>
  )
}))

vi.mock('../components/BooksCarousel', () => ({
  default: ({ books, loading }: any) => (
    <div data-testid="mock-carousel">
      BooksCount: {books?.length} | Loading: {String(loading)}
    </div>
  )
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Nastavíme, co mají hooky vrátit za data
    vi.mocked(useFeaturedBooks).mockReturnValue({
      books: [{ id: 1, title: 'Kniha 1' }, { id: 2, title: 'Kniha 2' }],
      loading: false
    } as any)

    vi.mocked(useHomeStats).mockReturnValue({
      totalBooks: 1500,
      totalGenres: 25,
      totalUsers: 300,
      bestseller: { id: 99, title: 'Super trhák' },
      loading: false
    } as any)
  })

  it('vyrenderuje bannery a karusel se správnými daty z hooků', () => {
    render(<HomePage />)
    
    // Ověříme HeroBanner
    expect(screen.getByTestId('mock-hero')).toBeInTheDocument()
    expect(screen.getByText('Bestseller: Super trhák | Loading: false')).toBeInTheDocument()

    // Ověříme StatsBanner
    expect(screen.getByTestId('mock-stats')).toBeInTheDocument()
    expect(screen.getByText('Books: 1500 | Genres: 25 | Users: 300 | Loading: false')).toBeInTheDocument()

    // Ověříme BooksCarousel
    expect(screen.getByTestId('mock-carousel')).toBeInTheDocument()
    expect(screen.getByText('BooksCount: 2 | Loading: false')).toBeInTheDocument()
  })
})