import { useBooksFilter } from '../hooks/useBooksFilter'
import BooksFilters from '../components/BooksFilters'
import BooksGrid from '../components/BooksGrid'
import { useEffect } from 'react'

export default function BooksPage() {
  const {
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
  } = useBooksFilter()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [booksResponse?.page]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <BooksFilters
        title={title}
        setTitle={setTitle}
        genre={genre}
        setGenre={setGenre}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        genres={genres}
        onSearch={handleSearch}
        onGenreChange={handleGenreChange}
        onPriceBlur={handlePriceBlur}
        onClearFilters={clearFilters}
      />
      <BooksGrid
        booksResponse={booksResponse}
        loading={loading}
        error={error}
        onRetry={loadBooks}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  )
}