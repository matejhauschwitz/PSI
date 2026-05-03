// Modal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Modal from './Modal'

describe('Modal', () => {
  it('nevykreslí nic, pokud není otevřený (open=false)', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <div data-testid="modal-content">Tajný obsah</div>
      </Modal>
    )

    expect(screen.queryByTestId('modal-content')).not.toBeInTheDocument()
  })

  it('vykreslí obsah a titulek, když je otevřený (open=true)', () => {
    render(
      <Modal open={true} title="Upozornění" onClose={vi.fn()}>
        <div data-testid="modal-content">Viditelný obsah</div>
      </Modal>
    )

    expect(screen.getByText('Upozornění')).toBeInTheDocument()
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
  })

  it('zavolá onClose při kliknutí na zavírací tlačítko', async () => {
    const mockOnClose = vi.fn()
    const user = userEvent.setup()

    render(
      <Modal open={true} onClose={mockOnClose}>
        Obsah
      </Modal>
    )

    const closeBtn = screen.getByLabelText('Zavřít')
    await user.click(closeBtn)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('zavolá onClose při stisku klávesy Escape', () => {
    const mockOnClose = vi.fn()

    render(
      <Modal open={true} onClose={mockOnClose}>
        Obsah
      </Modal>
    )

    // Fire global keyboard event na window objektu
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})