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
  
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    loadGenres()
  }, [])

  useEffect(() => {
    loadBooks()
  }, [page, genre]) 

  const loadBooks = async (targetPage = page) => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBooks(
        targetPage,
        pageSize,
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
    setPage(1)
    if (page === 1) loadBooks(1)
  }

  const handleGenreChange = (value: string) => {
    setPage(1)
    setGenre(value)
  }

  const handlePriceBlur = () => {
    setPage(1)
    if (page === 1) loadBooks(1)
  }

  const clearFilters = () => {
    setTitle('')
    setGenre('')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
  }

  const hasActiveFilters = !!(title || genre || minPrice || maxPrice)

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
    loadBooks,
    page,
    setPage
  }
}