// CartItems.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import CartItems from './CartItems'
import toast from 'react-hot-toast'

// Musíme namockovat react-hot-toast, abychom zkontrolovali volání
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
  }
}))

describe('CartItems', () => {
  const mockItems = [
    { id: 1, title: 'Kniha A', author: 'Autor A', price: 150.5, genre: 'Sci-fi' },
    { id: 2, title: 'Kniha B', author: 'Autor B', price: null } // Otestujeme chybějící cenu
  ]

  it('zobrazí seznam knih s jejich vlastnostmi', () => {
    render(<CartItems items={mockItems as any} onRemove={vi.fn()} />)

    expect(screen.getByText('Kniha A')).toBeInTheDocument()
    expect(screen.getByText('Autor A')).toBeInTheDocument()
    expect(screen.getByText('Žánr: Sci-fi')).toBeInTheDocument()
    
    // Zkontrolujeme formátování ceny
    expect(screen.getByText('150.50 Kč')).toBeInTheDocument()

    // Otestujeme chybějící cenu
    expect(screen.getByText('Kniha B')).toBeInTheDocument()
    expect(screen.getByText('Neuvedeno')).toBeInTheDocument()
  })

  it('zavolá onRemove a zobrazí toast notifikaci při kliknutí na tlačítko odebrat', async () => {
    const mockOnRemove = vi.fn()
    const user = userEvent.setup()

    render(<CartItems items={[mockItems[0]] as any} onRemove={mockOnRemove} />)

    // Tlačítko hledáme podle titulku (title attribute v DOMu, nebo aria-label)
    const removeBtn = screen.getByTitle('Odebrat')
    await user.click(removeBtn)

    expect(mockOnRemove).toHaveBeenCalledWith(1)
    expect(toast.success).toHaveBeenCalledWith('"Kniha A" odstraněno z košíku')
  })
  
  it('zvládne vykreslit i pokud chybí pole obrázku nebo žánru', () => {
      // Test the conditional rendering rules
      render(<CartItems items={[{id: 3, title: 'Minimal Book'} as any]} onRemove={vi.fn()} />)
      expect(screen.getByText('Minimal Book')).toBeInTheDocument()
  })
})