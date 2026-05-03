import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CommentsSection from './CommentsSection'

describe('CommentsSection', () => {
    const defaultProps = {
        bookId: 1,
        comments: [],
        onAddComment: vi.fn(),
        isAuthenticated: true,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('vykreslí zprávu pro prázdný seznam komentářů[cite: 16]', () => {
        render(<CommentsSection {...defaultProps} />)
        expect(screen.getByText('Zatím bez komentářů. Buďte první!')).toBeInTheDocument()
    })

    it('vykreslí seznam komentářů se správnými detaily[cite: 16]', () => {
        const mockComments = [
            {
                id: 1,
                comment: 'Skvělá kniha',
                rating: 5,
                creatorUserName: 'User1',
                createdAt: '2024-01-01T10:00:00Z',
            },
            {
                id: 2,
                comment: 'Špatná kniha',
                rating: 1,
                creatorUserName: null,
                createdAt: null,
            },
        ]

        render(<CommentsSection {...defaultProps} comments={mockComments as any} />)

        expect(screen.getByText('Skvělá kniha')).toBeInTheDocument()
        expect(screen.getByText('User1')).toBeInTheDocument()
        expect(screen.getByText('1. 1. 2024')).toBeInTheDocument()

        expect(screen.getByText('Špatná kniha')).toBeInTheDocument()
        expect(screen.getByText('Anonymní')).toBeInTheDocument()
    })

    it('nevykreslí tlačítko "Přidat recenzi", pokud uživatel není přihlášen[cite: 16]', () => {
        render(<CommentsSection {...defaultProps} isAuthenticated={false} />)

        // There are two "Přidat recenzi" texts when modal is open (button and heading), 
        // but only one (the button) when closed. 
        // Since isAuthenticated is false, neither should be present if we query carefully,
        // but wait, the heading "Recenze a komentáře" is always there.
        // The button has the text "Přidat recenzi".
        expect(screen.queryByRole('button', { name: 'Přidat recenzi' })).not.toBeInTheDocument()
        expect(screen.getByText('Přihlaste se pro přidání recenze')).toBeInTheDocument()
    })

    it('otevře a zavře modální okno pro přidání recenze[cite: 16]', async () => {
        const user = userEvent.setup()
        render(<CommentsSection {...defaultProps} />)

        const openBtn = screen.getByRole('button', { name: 'Přidat recenzi' })
        await user.click(openBtn)

        // Verify modal is open by looking for the submit button
        expect(screen.getByText('Odeslat')).toBeInTheDocument()

        const cancelBtn = screen.getByText('Zrušit')
        await user.click(cancelBtn)

        // Verify modal is closed
        expect(screen.queryByText('Odeslat')).not.toBeInTheDocument()
    })

    it('neumožní odeslat prázdný komentář[cite: 16]', async () => {
        const user = userEvent.setup()
        render(<CommentsSection {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: 'Přidat recenzi' }))

        const submitBtn = screen.getByText('Odeslat')
        expect(submitBtn).toBeDisabled()
    })

    it('odešle komentář se správnými daty a zavře modál[cite: 16]', async () => {
        const user = userEvent.setup()
        const mockAddComment = vi.fn().mockResolvedValue(undefined)

        render(<CommentsSection {...defaultProps} onAddComment={mockAddComment} />)

        await user.click(screen.getByRole('button', { name: 'Přidat recenzi' }))

        const textarea = screen.getByPlaceholderText('Sdělte svoje zkušenosti s touto knihou...')
        await user.type(textarea, 'Tohle je testovací komentář')

        const submitBtn = screen.getByText('Odeslat')
        expect(submitBtn).not.toBeDisabled()

        await user.click(submitBtn)

        expect(mockAddComment).toHaveBeenCalledWith({
            bookId: 1,
            comment: 'Tohle je testovací komentář',
            rating: 5,
        })

        await waitFor(() => {
            expect(screen.queryByText('Odeslat')).not.toBeInTheDocument()
        })
    })

    it('zobrazí chybovou hlášku, pokud odeslání selže[cite: 16]', async () => {
        const user = userEvent.setup()
        const mockAddComment = vi.fn().mockRejectedValue(new Error('Server error'))

        render(<CommentsSection {...defaultProps} onAddComment={mockAddComment} />)

        await user.click(screen.getByRole('button', { name: 'Přidat recenzi' }))
        const textarea = screen.getByPlaceholderText('Sdělte svoje zkušenosti s touto knihou...')
        await user.type(textarea, 'Chyba')

        await user.click(screen.getByText('Odeslat'))

        await waitFor(() => {
            expect(screen.getByText('Server error')).toBeInTheDocument()
        })

        expect(textarea).toBeInTheDocument()
    })
})