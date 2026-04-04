import { useState, useEffect } from 'react'
import { bookService } from '../services/api'
import type { BooksResponse } from '../types'

export function useBooksFilter() {
  const [booksResponse, setBooksResponse] = useState<BooksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [genres, setGenres] = useState<string[]>([])

  useEffect(() => {
    loadGenres()
  }, [])

  useEffect(() => {
    loadBooks()
  }, [genre])

  const loadBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBooks(
        1,
        20,
        title,
        genre,
        minPrice ? parseFloat(minPrice) : undefined,
        maxPrice ? parseFloat(maxPrice) : undefined
      )
      setBooksResponse(response)
    } catch (err) {
      setError('Nepodařilo se načíst knihy')
      console.error('Error loading books:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadGenres = async () => {
    try {
      const genresList = await bookService.getGenres()
      setGenres(genresList)
    } catch (err) {
      console.error('Error loading genres:', err)
    }
  }

  const handleSearch = () => {
    loadBooks()
  }

  const handleGenreChange = (value: string) => {
    setGenre(value)
  }

  const handlePriceBlur = () => {
    loadBooks()
  }

  const clearFilters = () => {
    setTitle('')
    setGenre('')
    setMinPrice('')
    setMaxPrice('')
  }

  const hasActiveFilters = title || genre || minPrice || maxPrice

  return {
    booksResponse,
    loading,
    error,
    title,
    setTitle,
    genre,
    setGenre,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    genres,
    handleSearch,
    handleGenreChange,
    handlePriceBlur,
    clearFilters,
    hasActiveFilters,
    loadBooks
  }
}