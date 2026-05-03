import { Link } from 'react-router-dom'
import type { BooksResponse } from '../types'

interface BooksGridProps {
  booksResponse: BooksResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  onPageChange: (page: number) => void // Přidaná prop pro navigaci
}

export default function BooksGrid({
  booksResponse,
  loading,
  error,
  onRetry,
  hasActiveFilters,
  onClearFilters,
  onPageChange
}: BooksGridProps) {
  
  // Pomocná funkce pro výpočet čísel stránek (max 3)
  const getPageNumbers = () => {
    if (!booksResponse) return [];
    const { page, totalPages } = booksResponse;
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + 2);
    
    // Korekce, pokud jsme na konci seznamu
    if (end - start < 2) {
      start = Math.max(1, end - 2);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

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

          {/* --- KOMPAKTNÍ PAGER --- */}
          {booksResponse.totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-stone-200 shadow-sm">
                {/* Šipka vlevo */}
                <button
                  onClick={() => onPageChange(booksResponse.page - 1)}
                  disabled={booksResponse.page === 1}
                  className="p-2 rounded-xl hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="block w-5 h-5">←</span>
                </button>

                {/* Čísla stránek */}
                <div className="flex items-center">
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`min-w-[40px] h-10 flex items-center justify-center rounded-xl font-medium transition-colors ${
                        booksResponse.page === pageNum
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Šipka vpravo */}
                <button
                  onClick={() => onPageChange(booksResponse.page + 1)}
                  disabled={booksResponse.page === booksResponse.totalPages}
                  className="p-2 rounded-xl hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="block w-5 h-5">→</span>
                </button>
              </div>
              
              <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">
                Strana {booksResponse.page} z {booksResponse.totalPages}
              </div>
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