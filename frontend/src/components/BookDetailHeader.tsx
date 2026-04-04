import { Heart, ShoppingCart, ArrowLeft, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Book } from '../types'

interface BookDetailHeaderProps {
  book: Book
  isFavourite: boolean
  onToggleFavourite: () => void
  onAddToCart: () => void
  isAuthenticated: boolean
}

export default function BookDetailHeader({
  book,
  isFavourite,
  onToggleFavourite,
  onAddToCart,
  isAuthenticated
}: BookDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Zpět na knihy</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Book Cover */}
          <div className="md:w-1/3 bg-stone-100 p-8 flex items-center justify-center">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                className="w-full max-w-xs rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full max-w-xs aspect-[3/4] bg-stone-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-stone-400">
                  <div className="text-4xl mb-2">📚</div>
                  <div>Bez obálky</div>
                </div>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="md:w-2/3 p-8 md:p-12 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              {book.genre && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">
                  {book.genre}
                </span>
              )}
              {book.rating && (
                <div className="flex items-center text-amber-500 text-sm font-medium">
                  <span className="text-lg">⭐</span>
                  <span className="ml-1">{book.rating.toFixed(1)}</span>
                  {book.totalRatings && (
                    <span className="text-stone-500 ml-1">({book.totalRatings})</span>
                  )}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{book.title}</h1>
            <p className="text-xl text-stone-500 mb-6">od {book.author}</p>

            {book.description && (
              <p className="text-stone-600 mb-8 leading-relaxed">{book.description}</p>
            )}

            {/* Book Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-stone-600 bg-stone-50 p-4 rounded-2xl">
              {book.publicationYear && (
                <div>
                  <span className="font-medium text-stone-900">Rok vydání:</span> {book.publicationYear}
                </div>
              )}
              {book.pageCount && (
                <div>
                  <span className="font-medium text-stone-900">Počet stran:</span> {book.pageCount}
                </div>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-auto gap-4">
              {book.price && (
                <div className="text-3xl font-bold text-stone-900">{book.price} Kč</div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onToggleFavourite}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    isFavourite
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFavourite ? 'fill-current' : ''}`} />
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={onAddToCart}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Do košíku
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 bg-stone-600 hover:bg-stone-700 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
                  >
                    <LogIn className="h-5 w-5" />
                    Pro nákup se přihlašte
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}