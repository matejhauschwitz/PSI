import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import BooksGrid from './BooksGrid'
import type { BooksResponse } from '../types'

describe('BooksGrid', () => {
    const defaultProps = {
        booksResponse: null,
        loading: false,
        error: null,
        onRetry: vi.fn(),
        hasActiveFilters: false,
        onClearFilters: vi.fn(),
        onPageChange: vi.fn()
    }

    const mockBooksResponse: BooksResponse = {
        books: [
            { id: 1, title: 'Book 1', author: 'Author 1', price: 100, genre: 'Sci-fi', rating: 4.5, totalRatings: 10 },
            { id: 2, title: 'Book 2', author: 'Author 2', coverImageUrl: 'url' }
        ],
        totalRecords: 20,
        totalPages: 5,
        page: 1,
        limit: 4
    }

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>)
    }

    it('vykreslí stav načítání[cite: 14]', () => {
        renderWithRouter(<BooksGrid {...defaultProps} loading={true} />)
        expect(screen.getByText('Načítání knih...')).toBeInTheDocument()
    })

    it('vykreslí chybový stav a tlačítko Zkusit znovu[cite: 14]', async () => {
        const user = userEvent.setup()
        renderWithRouter(<BooksGrid {...defaultProps} error="Něco se pokazilo" />)

        expect(screen.getByText('Něco se pokazilo')).toBeInTheDocument()

        const retryBtn = screen.getByText('Zkusit znovu')
        await user.click(retryBtn)
        expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
    })

    it('vykreslí zprávu o prázdném výsledku, pokud nejsou nalezeny žádné knihy[cite: 14]', () => {
        const emptyResponse = { ...mockBooksResponse, books: [] }
        renderWithRouter(<BooksGrid {...defaultProps} booksResponse={emptyResponse} />)

        expect(screen.getByText('Žádné knihy nenalezeny')).toBeInTheDocument()
    })

    it('zobrazí tlačítko na zrušení filtrů, pokud nejsou knihy a filtry jsou aktivní[cite: 14]', async () => {
        const user = userEvent.setup()
        const emptyResponse = { ...mockBooksResponse, books: [] }

        renderWithRouter(
            <BooksGrid
                {...defaultProps}
                booksResponse={emptyResponse}
                hasActiveFilters={true}
            />
        )

        const clearFiltersBtn = screen.getByText('Zobrazit všechny knihy')
        await user.click(clearFiltersBtn)
        expect(defaultProps.onClearFilters).toHaveBeenCalledTimes(1)
    })

    it('nevykreslí tlačítko na zrušení filtrů, pokud knihy nejsou a filtry nejsou aktivní[cite: 14]', () => {
        const emptyResponse = { ...mockBooksResponse, books: [] }
        renderWithRouter(
            <BooksGrid
                {...defaultProps}
                booksResponse={emptyResponse}
                hasActiveFilters={false}
            />
        )

        expect(screen.queryByText('Zobrazit všechny knihy')).not.toBeInTheDocument()
    })

    it('vykreslí seznam knih se správnými detaily[cite: 14]', () => {
        renderWithRouter(<BooksGrid {...defaultProps} booksResponse={mockBooksResponse} />)

        expect(screen.getByText('Zobrazeno 2 z 20 knih')).toBeInTheDocument()
        expect(screen.getByText('Book 1')).toBeInTheDocument()
        expect(screen.getByText('Author 1')).toBeInTheDocument()
        expect(screen.getByText('Sci-fi')).toBeInTheDocument()
        expect(screen.getByText('100 Kč')).toBeInTheDocument()

        // Test rating format: "4.5 (10)"
        expect(screen.getByText(/4\.5/)).toBeInTheDocument()
        expect(screen.getByText(/\(10\)/)).toBeInTheDocument()

        expect(screen.getByText('Book 2')).toBeInTheDocument()
        // Test fallback image
        expect(screen.getByText('Bez obálky')).toBeInTheDocument()
    })

    describe('Paginace', () => {
        it('vykreslí stránkování a volá onPageChange[cite: 14]', async () => {
            const user = userEvent.setup()
            renderWithRouter(<BooksGrid {...defaultProps} booksResponse={mockBooksResponse} />) // page 1 of 5

            expect(screen.getByText('Strana 1 z 5')).toBeInTheDocument()

            const prevButton = screen.getByRole('button', { name: '←' })
            const nextButton = screen.getByRole('button', { name: '→' })
            const page2Button = screen.getByRole('button', { name: '2' })

            // Prev should be disabled on page 1
            expect(prevButton).toBeDisabled()
            expect(nextButton).not.toBeDisabled()

            await user.click(nextButton)
            expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)

            await user.click(page2Button)
            expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
        })

        it('vypočítá a zobrazí správná čísla stránek uprostřed[cite: 14]', () => {
            const midResponse = { ...mockBooksResponse, page: 3 }
            renderWithRouter(<BooksGrid {...defaultProps} booksResponse={midResponse} />)

            expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
            // Should not show 1 or 5 based on the max 3 pages logic in the component
            expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()
            expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
        })

        it('zakáže tlačítko vpřed na poslední stránce[cite: 14]', () => {
            const lastPageResponse = { ...mockBooksResponse, page: 5 }
            renderWithRouter(<BooksGrid {...defaultProps} booksResponse={lastPageResponse} />)

            const nextButton = screen.getByRole('button', { name: '→' })
            expect(nextButton).toBeDisabled()
        })
    })
})