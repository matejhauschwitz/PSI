import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import React from 'react'
import { CartProvider, useCart } from './CartContext'
import { Book } from '../types'

describe('CartContext & useCart', () => {
  const mockBook: Book = { id: 1, title: 'Testovací Kniha', price: 200 }
  const mockBook2: Book = { id: 2, title: 'Druhá Kniha', price: 350 }

  // Wrapper, který obalí testovaný hook do Provideru
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CartProvider>{children}</CartProvider>
  )

  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('inicializuje se s prázdným košíkem', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
  })

  it('přidá knihu do košíku a uloží ji do localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockBook)
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0]).toEqual(mockBook)
    expect(result.current.cartCount).toBe(1)
    
    // Ověření localStorage
    const stored = JSON.parse(window.localStorage.getItem('cart') || '[]')
    expect(stored).toEqual([mockBook])
  })

  it('nepřidá stejnou knihu dvakrát', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockBook)
      result.current.addToCart(mockBook) // Duplicitní přidání
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartCount).toBe(1)
  })

  it('odebere knihu z košíku', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockBook)
      result.current.addToCart(mockBook2)
    })

    act(() => {
      result.current.removeFromCart(1) // Odebereme ID 1
    })

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(2)
  })

  it('vymaže celý košík', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockBook)
      result.current.clearCart()
    })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.cartCount).toBe(0)
  })

  it('správně vypočítá celkovou cenu (getCartTotal)', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => {
      result.current.addToCart(mockBook)
      result.current.addToCart(mockBook2)
    })

    expect(result.current.getCartTotal()).toBe(550) // 200 + 350
  })

  it('načte data z localStorage při inicializaci', () => {
    const savedCart = [mockBook2]
    window.localStorage.setItem('cart', JSON.stringify(savedCart))

    const { result } = renderHook(() => useCart(), { wrapper })

    expect(result.current.cartItems).toEqual(savedCart)
    expect(result.current.cartCount).toBe(1)
  })

  it('vyhodí chybu, pokud je hook použit mimo CartProvider', () => {
    // Potlačíme console.error, protože očekáváme chybu a nechceme "špinavý" log
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => renderHook(() => useCart())).toThrow('useCart musí být použit uvnitř CartProvider')

    consoleSpy.mockRestore()
  })

  it('ošetří chybu při parsování poškozených dat z localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.localStorage.setItem('cart', 'invalid-json-{')

    const { result } = renderHook(() => useCart(), { wrapper })

    // Měl by zůstat prázdný košík místo pádu aplikace
    expect(result.current.cartItems).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to parse cart'), expect.any(Error))

    consoleSpy.mockRestore()
  })
})