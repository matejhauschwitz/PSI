import { Link } from 'react-router-dom'
import type { Book, BooksResponse } from '../types'

interface BooksGridProps {
  booksResponse: BooksResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export default function BooksGrid({
  booksResponse,
  loading,
  error,
  onRetry,
  hasActiveFilters,
  onClearFilters
}: BooksGridProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-stone-600">Načítání knih...</div>
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
    <div className="flex-1">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Knihy</h1>
        <p className="text-stone-600 max-w-2xl mx-auto">
          Prohlédněte si naši sbírku knih a najděte si tu pravou pro vás.
        </p>
      </div>

      {/* Books Grid */}
      {booksResponse && booksResponse.books.length > 0 ? (
        <>
          <div className="text-stone-600 text-center mb-6">
            Zobrazeno {booksResponse.books.length} z {booksResponse.totalRecords} knih
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {booksResponse.books.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Book Cover */}
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

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-stone-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
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
                      <span className="font-semibold text-blue-600">
                        {book.price} Kč
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination info */}
          {booksResponse.totalPages > 1 && (
            <div className="text-center text-stone-600 mt-8">
              Strana {booksResponse.page} z {booksResponse.totalPages}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-stone-600 mb-4">Žádné knihy nenalezeny</div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              Zobrazit všechny knihy
            </button>
          )}
        </div>
      )}
    </div>
  )
}