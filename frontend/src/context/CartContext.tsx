import React, { createContext, useContext, useState, useEffect } from 'react'
import { Book } from '../types'

interface CartContextType {
  cartCount: number
  cartItems: Book[]
  addToCart: (book: Book) => void
  removeFromCart: (bookId: number) => void
  clearCart: () => void
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Book[]>([])

  // Načti košík z localStorage při startu
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) {
      try {
        setCartItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
      }
    }
  }, [])

  // Ulož košík do localStorage pokaždé když se změní
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (book: Book) => {
    setCartItems(prev => {
      // Zkontroluj jestli kniha již není v košíku
      if (prev.find(item => item.id === book.id)) {
        return prev
      }
      return [...prev, book]
    })
  }

  const removeFromCart = (bookId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== bookId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartCount: cartItems.length,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart musí být použit uvnitř CartProvider')
  }
  return context
}
