import { useBookDetail } from '../hooks/useBookDetail'
import BookDetailHeader from '../components/BookDetailHeader'
import CommentsSection from '../components/CommentsSection'
import { authService } from '../services/api'

export default function BookDetailPage() {
  const { book, comments, loading, error, isFavourite, toggleFavourite, addComment } =
    useBookDetail()

  const isAuthenticated = authService.isAuthenticated()

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-stone-600">Načítání detailů knihy...</div>
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Kniha nebyla nalezena'}</div>
      </div>
    )
  }

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log('Add to cart:', book.id)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <BookDetailHeader
        book={book}
        isFavourite={isFavourite}
        onToggleFavourite={toggleFavourite}
        onAddToCart={handleAddToCart}
        isAuthenticated={isAuthenticated}
      />

      <CommentsSection
        bookId={book.id}
        comments={comments}
        onAddComment={addComment}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
