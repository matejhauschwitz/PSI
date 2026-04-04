import { useState, useEffect, useCallback } from 'react'
import { bookService } from '../services/api'
import type { BooksResponse } from '../types'

export function useFavourites() {
  const [booksResponse, setBooksResponse] = useState<BooksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFavourites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getFavourites(1, 20)
      setBooksResponse(response)
    } catch (err) {
      setError('Nepodařilo se načíst oblíbené knihy')
      console.error('Error loading favourites:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFavourites()
  }, [loadFavourites])

  const handleRemoveFavourite = useCallback(
    async (bookId: number) => {
      try {
        // Optimistické odebrání - předpokládáme úspěch
        setBooksResponse((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            books: prev.books.filter((b) => b.id !== bookId),
            totalRecords: prev.totalRecords - 1
          }
        })

        // Provedeme skutečné odebrání na backendu
        await bookService.removeFavourite(bookId)
      } catch (err) {
        // Pokud selže, znovu načteme seznam
        setError('Nepodařilo se odebrat knihu')
        console.error('Error removing favourite:', err)
        await loadFavourites()
      }
    },
    [loadFavourites]
  )

  return {
    booksResponse,
    loading,
    error,
    loadFavourites,
    handleRemoveFavourite
  }
}
