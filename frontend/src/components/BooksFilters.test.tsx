import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BooksFilters from './BooksFilters'

describe('BooksFilters', () => {
  const defaultProps = {
    title: '',
    setTitle: vi.fn(),
    genre: '',
    setGenre: vi.fn(),
    minPrice: '',
    setMinPrice: vi.fn(),
    maxPrice: '',
    setMaxPrice: vi.fn(),
    genres: ['Sci-fi', 'Fantasy', 'Horor', 'Drama'],
    onSearch: vi.fn(),
    onGenreChange: vi.fn(),
    onPriceBlur: vi.fn(),
    onClearFilters: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('vykreslí všechny ovládací prvky filtrů', () => {
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    expect(screen.getByPlaceholderText('Hledat...')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByPlaceholderText('Filtrovat žánry...')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByText('Všechny žánry')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByPlaceholderText('Od')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByPlaceholderText('Do')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByText('Aplikovat filtry')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByText('Vymazat vše')).toBeInTheDocument() //[cite: 13]
  })

  it('volá setTitle při psaní do vyhledávání názvu a onSearch při stisku Enter', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    const titleInput = screen.getByPlaceholderText('Hledat...') //[cite: 13]
    
    await user.type(titleInput, 'Zaklínač')
    expect(defaultProps.setTitle).toHaveBeenCalled() //[cite: 13]

    await user.keyboard('{Enter}')
    expect(defaultProps.onSearch).toHaveBeenCalledTimes(1) //[cite: 13]
  })

  it('filtruje seznam žánrů pomocí mini-vyhledávání', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    expect(screen.getByText('Sci-fi')).toBeInTheDocument() //[cite: 13]
    expect(screen.getByText('Fantasy')).toBeInTheDocument() //[cite: 13]

    const genreSearchInput = screen.getByPlaceholderText('Filtrovat žánry...') //[cite: 13]
    await user.type(genreSearchInput, 'fan') //[cite: 13]

    expect(screen.getByText('Fantasy')).toBeInTheDocument() //[cite: 13]
    expect(screen.queryByText('Sci-fi')).not.toBeInTheDocument() //[cite: 13]
  })

  it('zobrazí zprávu, pokud mini-vyhledávání nenajde žádný žánr', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    const genreSearchInput = screen.getByPlaceholderText('Filtrovat žánry...') //[cite: 13]
    await user.type(genreSearchInput, 'NexistujiciZanr') //[cite: 13]

    expect(screen.getByText('Žádný žánr nenalezen')).toBeInTheDocument() //[cite: 13]
  })

  it('volá onGenreChange při výběru žánru', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    const fantasyButton = screen.getByText('Fantasy') //[cite: 13]
    await user.click(fantasyButton)

    expect(defaultProps.onGenreChange).toHaveBeenCalledWith('Fantasy') //[cite: 13]

    const allGenresButton = screen.getByText('Všechny žánry') //[cite: 13]
    await user.click(allGenresButton)

    expect(defaultProps.onGenreChange).toHaveBeenCalledWith('') //[cite: 13]
  })

  it('volá setMinPrice, setMaxPrice při psaní a onPriceBlur při opuštění inputu', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    const minInput = screen.getByPlaceholderText('Od') //[cite: 13]
    const maxInput = screen.getByPlaceholderText('Do') //[cite: 13]

    await user.type(minInput, '100')
    expect(defaultProps.setMinPrice).toHaveBeenCalled() //[cite: 13]

    await user.click(maxInput) // Blur trigger pro minInput
    expect(defaultProps.onPriceBlur).toHaveBeenCalledTimes(1) //[cite: 13]

    await user.type(maxInput, '500')
    expect(defaultProps.setMaxPrice).toHaveBeenCalled() //[cite: 13]

    await user.click(document.body) // Blur trigger pro maxInput
    expect(defaultProps.onPriceBlur).toHaveBeenCalledTimes(2) //[cite: 13]
  })

  it('volá onSearch při kliknutí na Aplikovat filtry', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    const applyButton = screen.getByText('Aplikovat filtry') //[cite: 13]
    await user.click(applyButton)

    expect(defaultProps.onSearch).toHaveBeenCalledTimes(1) //[cite: 13]
  })

  it('volá onClearFilters a vymaže mini-vyhledávání při kliknutí na Vymazat vše', async () => {
    const user = userEvent.setup()
    render(<BooksFilters {...defaultProps} />) //[cite: 13]

    const genreSearchInput = screen.getByPlaceholderText('Filtrovat žánry...') //[cite: 13]
    await user.type(genreSearchInput, 'fan') //[cite: 13]
    expect(screen.queryByText('Sci-fi')).not.toBeInTheDocument() //[cite: 13]

    const clearButton = screen.getByText('Vymazat vše') //[cite: 13]
    await user.click(clearButton)

    expect(defaultProps.onClearFilters).toHaveBeenCalledTimes(1) //[cite: 13]
    // Mini-vyhledávání by mělo být prázdné a Sci-fi by mělo být znovu vidět
    expect(screen.getByText('Sci-fi')).toBeInTheDocument() //[cite: 13]
  })
})