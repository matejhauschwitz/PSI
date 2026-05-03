import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import BookForm from './BookForm'
import { AdminBook } from '../services/adminService'

describe('BookForm', () => {
  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  const defaultBook: AdminBook = {
    title: 'Test Title',
    authors: 'Test Author',
    price: 100,
    isbn10: '1234567890',
    isbn13: '1234567890123'
  }

  it('vykreslí formulář s prázdnými poli, pokud není předána kniha', () => {
    const { container } = render(<BookForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    // Hledáme přímo podle atributu 'name', který v kódu máte
    expect(container.querySelector('input[name="title"]')).toHaveValue('')
    expect(container.querySelector('input[name="authors"]')).toHaveValue('')
    expect(container.querySelector('input[name="price"]')).toHaveValue(0)
  })

  it('vykreslí formulář s daty předané knihy', () => {
    const { container } = render(
      <BookForm book={defaultBook} onSubmit={mockSubmit} onCancel={mockCancel} />
    )

    expect(container.querySelector('input[name="title"]')).toHaveValue('Test Title')
    expect(container.querySelector('input[name="authors"]')).toHaveValue('Test Author')
    expect(container.querySelector('input[name="price"]')).toHaveValue(100)
  })

  it('zavolá onCancel při kliknutí na tlačítko Zrušit', async () => {
    const user = userEvent.setup()
    render(<BookForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    const cancelButton = screen.getByText('Zrušit')
    await user.click(cancelButton)

    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  it('aktualizuje stav při změně vstupu', async () => {
    const user = userEvent.setup()
    const { container } = render(<BookForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
    await user.type(titleInput, 'Nová Kniha')

    expect(titleInput).toHaveValue('Nová Kniha')
  })

  it('zavolá onSubmit se správnými daty při odeslání', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BookForm book={defaultBook} onSubmit={mockSubmit} onCancel={mockCancel} />
    )

    const form = container.querySelector('form')
    fireEvent.submit(form!)

    expect(mockSubmit).toHaveBeenCalledWith(defaultBook)
  })

  it('zavolá onSubmit s aktualizovanými daty', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BookForm book={defaultBook} onSubmit={mockSubmit} onCancel={mockCancel} />
    )

    const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
    
    // Vymažeme a napíšeme nový název
    await user.clear(titleInput)
    await user.type(titleInput, 'Upravený Název')

    const form = container.querySelector('form')
    fireEvent.submit(form!)

    expect(mockSubmit).toHaveBeenCalledWith({
      ...defaultBook,
      title: 'Upravený Název'
    })
  })
})