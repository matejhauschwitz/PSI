import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BooksCarousel from './BooksCarousel'
import type { Book } from '../types'

describe('BooksCarousel', () => {
  const generateMockBooks = (count: number): Book[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Kniha ${i + 1}`,
      author: `Autor ${i + 1}`,
      price: 100 + i,
      rating: 4.0 + (i % 2 === 0 ? 0.5 : 0),
      genre: 'Fantasy'
    }))
  }

  // Helper to wrap component in router because of <Link> usage[cite: 12]
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
  }

  const setWindowWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    window.dispatchEvent(new Event('resize'))
  }

  beforeEach(() => {
    // Default to desktop view
    setWindowWidth(1200)
  })

  it('zobrazí text načítání, když je loading true', () => {
    renderWithRouter(<BooksCarousel books={[]} loading={true} />)
    expect(screen.getByText('Načítám doporučené knihy...')).toBeInTheDocument()
  })

  it('nevykreslí nic, pokud je pole knih prázdné a načítání skončilo', () => {
    const { container } = renderWithRouter(<BooksCarousel books={[]} loading={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('vykreslí nadpis a knihy, když data existují', () => {
    const books = generateMockBooks(4)
    renderWithRouter(<BooksCarousel books={books} loading={false} />)

    expect(screen.getByText('Doporučované knihy')).toBeInTheDocument()
    expect(screen.getByText('Kniha 1')).toBeInTheDocument()
    expect(screen.getByText('Kniha 4')).toBeInTheDocument()
  })

  describe('Responzivní zobrazení (itemsPerPage)', () => {
    it('zobrazí 4 knihy na desktopu (šířka >= 1024)', () => {
      setWindowWidth(1024)
      const books = generateMockBooks(5)
      renderWithRouter(<BooksCarousel books={books} loading={false} />)

      // Only 4 should be visible
      expect(screen.getByText('Kniha 1')).toBeInTheDocument()
      expect(screen.getByText('Kniha 4')).toBeInTheDocument()
      expect(screen.queryByText('Kniha 5')).not.toBeInTheDocument()
    })

    it('zobrazí 2 knihy na tabletu (šířka >= 768 a < 1024)', () => {
      const books = generateMockBooks(5)
      
      // Need to set width and render within act if it triggers state update during render phase
      act(() => {
        setWindowWidth(800)
      })
      
      renderWithRouter(<BooksCarousel books={books} loading={false} />)

      expect(screen.getByText('Kniha 1')).toBeInTheDocument()
      expect(screen.getByText('Kniha 2')).toBeInTheDocument()
      expect(screen.queryByText('Kniha 3')).not.toBeInTheDocument()
    })

    it('zobrazí 1 knihu na mobilu (šířka < 768)', () => {
      act(() => {
        setWindowWidth(500)
      })
      const books = generateMockBooks(5)
      renderWithRouter(<BooksCarousel books={books} loading={false} />)

      expect(screen.getByText('Kniha 1')).toBeInTheDocument()
      expect(screen.queryByText('Kniha 2')).not.toBeInTheDocument()
    })
  })

  describe('Navigace', () => {
    it('posouvá se dopředu a dozadu pomocí tlačítek', async () => {
      setWindowWidth(1200) // 4 items per page
      const books = generateMockBooks(6) // 2 items on second "page"
      const user = userEvent.setup()

      renderWithRouter(<BooksCarousel books={books} loading={false} />)

      const nextButton = screen.getByLabelText('Další')
      const prevButton = screen.getByLabelText('Předchozí')

      // Initial state: Book 1 is visible, Book 6 is not
      expect(screen.getByText('Kniha 1')).toBeInTheDocument()
      expect(screen.queryByText('Kniha 6')).not.toBeInTheDocument()
      expect(prevButton).toBeDisabled()

      // Click Next
      await user.click(nextButton)
      // Now starting from index 1, so Books 2-5 should be visible. Book 1 disappears.
      expect(screen.queryByText('Kniha 1')).not.toBeInTheDocument()
      expect(screen.getByText('Kniha 5')).toBeInTheDocument()
      expect(prevButton).not.toBeDisabled()

      // Click Next again to reach the end
      await user.click(nextButton)
      expect(screen.getByText('Kniha 6')).toBeInTheDocument()
      expect(nextButton).toBeDisabled()

      // Click Prev to go back
      await user.click(prevButton)
      expect(screen.getByText('Kniha 2')).toBeInTheDocument() // Shows 2, 3, 4, 5
    })

    it('naviguje pomocí indikátorů dole', async () => {
      setWindowWidth(1200) // 4 items per page
      const books = generateMockBooks(8) // Exactly 2 pages
      const user = userEvent.setup()

      renderWithRouter(<BooksCarousel books={books} loading={false} />)

      const dots = screen.getAllByRole('button', { name: /Jít na stranu/i })
      expect(dots).toHaveLength(2)

      // Click the second dot
      await user.click(dots[1])

      // Should show books 5-8
      expect(screen.queryByText('Kniha 1')).not.toBeInTheDocument()
      expect(screen.getByText('Kniha 5')).toBeInTheDocument()
      expect(screen.getByText('Kniha 8')).toBeInTheDocument()
    })

    it('skryje navigační tlačítka, pokud je knih méně než kapacita stránky', () => {
      setWindowWidth(1200) // 4 items per page
      const books = generateMockBooks(3) // Only 3 books

      renderWithRouter(<BooksCarousel books={books} loading={false} />)

      expect(screen.queryByLabelText('Další')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Předchozí')).not.toBeInTheDocument()
    })
  })
})