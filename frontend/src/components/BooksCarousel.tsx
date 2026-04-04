import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Book } from '../types'

interface BooksCarouselProps {
  books: Book[]
  loading: boolean
}

export default function BooksCarousel({ books, loading }: BooksCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-600">Načítám doporučené knihy...</div>
      </div>
    )
  }

  if (books.length === 0) {
    return null
  }

  const maxIndex = Math.max(0, books.length - itemsPerPage)
  const hasNavigation = maxIndex > 0

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const visibleBooks = books.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900">Doporučované knihy</h2>
          <p className="text-slate-600 font-medium">Nejlépe hodnocené tituly z naší sbírky</p>
        </div>

        {/* Navigation arrows - Only show if there are more books than items per page */}
        {hasNavigation && (
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Předchozí"
            >
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Další"
            >
              <ChevronRight className="h-6 w-6 text-slate-900" />
            </button>
          </div>
        )}
      </div>

      {/* Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleBooks.map((book) => (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Book Cover */}
            <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📚</div>
                    <div className="text-xs">Bez obálky</div>
                  </div>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {book.title}
              </h3>
              
              <p className="text-sm text-slate-600">{book.author}</p>

              {book.genre && (
                <div className="inline-block bg-slate-100 text-slate-700 text-xs px-3 py-1 font-semibold uppercase tracking-wide">
                  {book.genre}
                </div>
              )}

              {/* Rating and Price */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {book.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-500">★</span>
                    <span className="font-bold text-sm text-slate-900">
                      {book.rating.toFixed(1)}
                    </span>
                  </div>
                )}

                {book.price && (
                  <span className="font-bold text-slate-900">{book.price} Kč</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Indicator */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {[...Array(Math.ceil(books.length / itemsPerPage))].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i * itemsPerPage)}
            className={`h-2 rounded-full transition-all ${
              i * itemsPerPage === currentIndex
                ? 'bg-blue-600 w-8'
                : 'bg-slate-300 w-2 hover:bg-slate-400'
            }`}
            aria-label={`Jít na stranu ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
