import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import type { BooksResponse, Book } from '../types'

interface FavouriteBookCardProps {
  book: Book
  onRemove: (bookId: number) => void
}

function FavouriteBookCard({ book, onRemove }: FavouriteBookCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow group relative">
      {/* Remove Button */}
      <button
        onClick={() => onRemove(book.id)}
        className="absolute top-2 right-2 z-10 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Odebrat z oblíbených"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Book Cover */}
      <Link to={`/books/${book.id}`} className="block">
        <div className="aspect-[3/4] bg-stone-100 flex items-center justify-center">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-stone-400 text-center p-4">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm">Bez obálky</div>
            </div>
          )}
        </div>
      </Link>

      {/* Book Info */}
      <div className="p-4">
        <Link to={`/books/${book.id}`} className="group/link">
          <h3 className="font-semibold text-stone-900 mb-1 line-clamp-2 group-hover/link:text-blue-600 transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-stone-600 text-sm mb-2">{book.author}</p>

        {book.genre && (
          <span className="inline-block bg-stone-100 text-stone-700 text-xs px-2 py-1 rounded-full mb-2">
            {book.genre}
          </span>
        )}

        <div className="flex items-center justify-between">
          {book.rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm text-stone-600">
                {book.rating.toFixed(1)} {book.totalRatings && `(${book.totalRatings})`}
              </span>
            </div>
          )}

          {book.price && (
            <span className="font-semibold text-blue-600">{book.price} Kč</span>
          )}
        </div>
      </div>
    </div>
  )
}

interface FavouritesBooksProps {
  booksResponse: BooksResponse | null
  loading: boolean
  error: string | null
  onRemove: (bookId: number) => void
  onRetry: () => void
}

export default function FavouritesBooksGrid({
  booksResponse,
  loading,
  error,
  onRemove,
  onRetry
}: FavouritesBooksProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-stone-600">Načítání oblíbených knih...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          Zkusit znovu
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-stone-900">Oblíbené knihy</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Váš seznam oblíbených knih. Knihy můžete odebrat kliknutím na ikonu odpadkového koše.
        </p>
      </div>

      {/* Books Grid */}
      {booksResponse && booksResponse.books.length > 0 ? (
        <>
          <div className="text-stone-600 text-center mb-6">
            Zobrazeno {booksResponse.books.length} knih
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {booksResponse.books.map((book) => (
              <FavouriteBookCard key={book.id} book={book} onRemove={onRemove} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-stone-600">Zatím nemáte žádné oblíbené knihy</div>
          <div className="mt-4">
            <Link to="/books" className="text-blue-600 hover:text-blue-700 transition-colors">
              Prohlédněte si naši sbírku
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
