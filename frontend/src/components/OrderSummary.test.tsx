// OrderSummary.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OrderSummary from './OrderSummary'

describe('OrderSummary', () => {
  it('vykreslí základní informace s metodou Transfer (Doprava Zdarma)', () => {
    render(<OrderSummary itemsCount={3} totalPrice={1000} paymentMethod="Transfer" />)

    expect(screen.getByText('Položky (3)')).toBeInTheDocument()
    
    // Použijeme rovnou getAllByText, protože očekáváme výskyt 2x (položky a celkem)
    const totals = screen.getAllByText('1000.00 Kč')
    expect(totals).toHaveLength(2)
    
    expect(screen.getByText('Doprava')).toBeInTheDocument()
    expect(screen.getByText('Zdarma')).toBeInTheDocument()
  })

  it('vypočítá správně cenu dopravy pro platbu na dobírku (OnDelivery)', () => {
    render(<OrderSummary itemsCount={1} totalPrice={500} paymentMethod="OnDelivery" />)

    // Doprava by měla být 50 Kč
    expect(screen.getByText('+50.00 Kč')).toBeInTheDocument()
    
    // Celková cena by měla být 550 Kč
    expect(screen.getByText('550.00 Kč')).toBeInTheDocument()
  })

  it('vypočítá správně příplatek pro platbu kartou (OnlineCard)', () => {
    render(<OrderSummary itemsCount={2} totalPrice={1000} paymentMethod="OnlineCard" />)

    // Příplatek by měl být 1% z 1000, tedy 10 Kč
    expect(screen.getByText('+10.00 Kč')).toBeInTheDocument()
    
    // Celková cena by měla být 1010 Kč
    expect(screen.getByText('1010.00 Kč')).toBeInTheDocument()
  })

  it('použije výchozí výpočet (Zdarma) pro neznámou platební metodu', () => {
    render(<OrderSummary itemsCount={5} totalPrice={200} paymentMethod="UnknownMethod" />)

    expect(screen.getByText('Zdarma')).toBeInTheDocument()
    
    // Opět testujeme, že jsou zde dva elementy se stejnou hodnotou
    const totals = screen.getAllByText('200.00 Kč')
    expect(totals).toHaveLength(2)
  })
})