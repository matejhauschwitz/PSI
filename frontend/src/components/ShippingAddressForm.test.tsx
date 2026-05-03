import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ShippingAddressForm from './ShippingAddressForm'

describe('ShippingAddressForm', () => {
  const mockAddress = {
    streetAddress: 'Dlouhá 123',
    city: 'Praha',
    zip: '11000',
    country: 'Česká republika'
  }

  const mockOnChange = vi.fn()

  it('správně vykreslí hodnoty adresy z props', () => {
    render(<ShippingAddressForm address={mockAddress} onChange={mockOnChange} />)

    expect(screen.getByPlaceholderText('Ulice a číslo popisné')).toHaveValue('Dlouhá 123')
    expect(screen.getByPlaceholderText('Město')).toHaveValue('Praha')
    expect(screen.getByPlaceholderText('PSČ')).toHaveValue('11000')
    expect(screen.getByPlaceholderText('Země')).toHaveValue('Česká republika')
  })

  it('zavolá onChange se správnými parametry při změně pole', () => {
    render(<ShippingAddressForm address={mockAddress} onChange={mockOnChange} />)

    const cityInput = screen.getByPlaceholderText('Město')
    fireEvent.change(cityInput, { target: { value: 'Brno' } })

    expect(mockOnChange).toHaveBeenCalledWith('city', 'Brno')
  })

  it('zavolá onChange při změně PSČ', () => {
    render(<ShippingAddressForm address={mockAddress} onChange={mockOnChange} />)

    const zipInput = screen.getByPlaceholderText('PSČ')
    fireEvent.change(zipInput, { target: { value: '60200' } })

    expect(mockOnChange).toHaveBeenCalledWith('zip', '60200')
  })
})