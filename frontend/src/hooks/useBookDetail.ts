import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { bookService, commentService } from '../services/api'
import type { Book, Comment } from '../types'

export function useBookDetail() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavourite, setIsFavourite] = useState(false)

  const bookId = Number(id)

  const loadComments = useCallback(async () => {
    if (!bookId) return
    try {
      const commentsData = await commentService.getComments(bookId)
      setComments(commentsData)
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }, [bookId])

  useEffect(() => {
    if (bookId) {
      loadBook()
      loadComments()
    }
  }, [bookId, loadComments])

  const loadBook = async () => {
    if (!bookId) return

    try {
      setLoading(true)
      setError(null)
      const bookData = await bookService.getBook(bookId)
      setBook(bookData)
    } catch (err) {
      setError('Nepodařilo se načíst detaily knihy')
      console.error('Error loading book:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavourite = async () => {
    if (!bookId) return

    try {
      if (isFavourite) {
        await bookService.removeFavourite(bookId)
      } else {
        await bookService.addFavourite(bookId)
      }
      setIsFavourite(!isFavourite)
    } catch (err) {
      console.error('Error toggling favourite:', err)
    }
  }

  const addComment = async (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    try {
      await commentService.addComment(comment as any)
      // Znovu načteme komentáře po přidání
      await loadComments()
      return true
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  return {
    book,
    comments,
    loading,
    error,
    isFavourite,
    toggleFavourite,
    addComment,
    bookId
  }
}