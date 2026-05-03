import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import FavouritesBooksGrid from './FavouritesBooksGrid' // Upravte import, pokud se soubor jmenuje jinak
import type { BooksResponse } from '../types'

describe('FavouritesBooksGrid', () => {
  const defaultProps = {
    booksResponse: null,
    loading: false,
    error: null,
    onRemove: vi.fn(),
    onRetry: vi.fn()
  }

  const mockBooksResponse: BooksResponse = {
    books: [
      { 
        id: 1, 
        title: 'Oblíbená Kniha 1', 
        author: 'Autor 1', 
        price: 150, 
        genre: 'Sci-fi', 
        rating: 4.8, 
        totalRatings: 42,
        coverImageUrl: 'http://test.com/image.jpg'
      },
      { 
        id: 2, 
        title: 'Oblíbená Kniha 2', 
        author: 'Autor 2' 
      } // Kniha bez detailů pro testování fallbacků
    ],
    totalRecords: 2,
    totalPages: 1,
    page: 1,
    limit: 20
  }

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
  }

  it('vykreslí indikátor načítání[cite: 17]', () => {
    renderWithRouter(<FavouritesBooksGrid {...defaultProps} loading={true} />)
    expect(screen.getByText('Načítání oblíbených knih...')).toBeInTheDocument()
  })

  it('vykreslí chybovou hlášku a zavolá onRetry[cite: 17]', async () => {
    const user = userEvent.setup()
    renderWithRouter(<FavouritesBooksGrid {...defaultProps} error="Nastala chyba API" />)
    
    expect(screen.getByText('Nastala chyba API')).toBeInTheDocument()
    
    const retryBtn = screen.getByText('Zkusit znovu')
    await user.click(retryBtn)
    
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
  })

  it('vykreslí zprávu, pokud je seznam oblíbených prázdný[cite: 17]', () => {
    const emptyResponse = { ...mockBooksResponse, books: [] }
    renderWithRouter(<FavouritesBooksGrid {...defaultProps} booksResponse={emptyResponse} />)
    
    expect(screen.getByText('Zatím nemáte žádné oblíbené knihy')).toBeInTheDocument()
    // Kontrola odkazu pro návrat
    const link = screen.getByRole('link', { name: 'Prohlédněte si naši sbírku' })
    expect(link).toHaveAttribute('href', '/books')
  })

  it('vykreslí grid s knihami a jejich detaily[cite: 17]', () => {
    renderWithRouter(<FavouritesBooksGrid {...defaultProps} booksResponse={mockBooksResponse} />)

    expect(screen.getByText('Oblíbené knihy')).toBeInTheDocument()
    expect(screen.getByText('Zobrazeno 2 knih')).toBeInTheDocument()
    
    // Kniha 1
    expect(screen.getByText('Oblíbená Kniha 1')).toBeInTheDocument()
    expect(screen.getByText('Autor 1')).toBeInTheDocument()
    expect(screen.getByText('Sci-fi')).toBeInTheDocument()
    expect(screen.getByText('150 Kč')).toBeInTheDocument()
    expect(screen.getByText(/4\.8/)).toBeInTheDocument()
    expect(screen.getByText(/\(42\)/)).toBeInTheDocument()
    
    // Obálka knihy 1
    const img = screen.getByRole('img', { name: 'Oblíbená Kniha 1' })
    expect(img).toHaveAttribute('src', 'http://test.com/image.jpg')

    // Kniha 2 (fallback pro obálku)
    expect(screen.getByText('Oblíbená Kniha 2')).toBeInTheDocument()
    expect(screen.getByText('Bez obálky')).toBeInTheDocument()
  })

  it('vygeneruje správné odkazy na detail knihy[cite: 17]', () => {
    renderWithRouter(<FavouritesBooksGrid {...defaultProps} booksResponse={mockBooksResponse} />)

    // Každá kniha má dva odkazy (jeden na obrázku, druhý na titulku)
    const links = screen.getAllByRole('link', { name: /Oblíbená Kniha 1/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', '/books/1')
  })

  it('zavolá onRemove při kliknutí na ikonu koše[cite: 17]', async () => {
    const user = userEvent.setup()
    renderWithRouter(<FavouritesBooksGrid {...defaultProps} booksResponse={mockBooksResponse} />)

    // Tlačítko hledáme podle title atributu z FavouriteBookCard
    const removeButtons = screen.getAllByTitle('Odebrat z oblíbených')
    expect(removeButtons).toHaveLength(2)

    // Klikneme na koš u první knihy (id: 1)
    await user.click(removeButtons[0])

    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1)
    expect(defaultProps.onRemove).toHaveBeenCalledWith(1)
  })
})