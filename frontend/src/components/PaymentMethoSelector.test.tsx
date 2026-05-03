import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PaymentMethodSelector from './PaymentMethodSelector'

describe('PaymentMethodSelector', () => {
  it('vykreslí všechny platební metody', () => {
    render(<PaymentMethodSelector value="OnlineCard" onChange={vi.fn()} />)

    expect(screen.getByText('Metoda platby')).toBeInTheDocument()
    expect(screen.getByLabelText('💳 Karta (Online)')).toBeInTheDocument()
    expect(screen.getByLabelText('🏦 Bankovní Převod')).toBeInTheDocument()
    expect(screen.getByLabelText('📦 Platba při Doručení')).toBeInTheDocument()
  })

  it('má zaškrtnutou správnou výchozí volbu', () => {
    render(<PaymentMethodSelector value="Transfer" onChange={vi.fn()} />)

    const cardRadio = screen.getByLabelText('💳 Karta (Online)') as HTMLInputElement
    const transferRadio = screen.getByLabelText('🏦 Bankovní Převod') as HTMLInputElement
    const deliveryRadio = screen.getByLabelText('📦 Platba při Doručení') as HTMLInputElement

    expect(cardRadio.checked).toBe(false)
    expect(transferRadio.checked).toBe(true)
    expect(deliveryRadio.checked).toBe(false)
  })

  it('zavolá onChange se správnou hodnotou při výběru', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()
    
    render(<PaymentMethodSelector value="OnlineCard" onChange={mockOnChange} />)

    const deliveryRadio = screen.getByLabelText('📦 Platba při Doručení')
    await user.click(deliveryRadio)

    expect(mockOnChange).toHaveBeenCalledTimes(1)
    expect(mockOnChange).toHaveBeenCalledWith('OnDelivery')
  })
})