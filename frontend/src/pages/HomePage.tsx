import { useFeaturedBooks } from '../hooks/useFeaturedBooks'
import { useHomeStats } from '../hooks/useHomeStats'
import HeroBanner from '../components/HeroBanner'
import StatsBanner from '../components/StatsBanner'
import BooksCarousel from '../components/BooksCarousel'

export default function HomePage() {
  const { books, loading: booksLoading } = useFeaturedBooks()
  const { totalBooks, totalGenres, totalUsers, bestseller, loading: statsLoading } = useHomeStats()

  return (
    <div className="space-y-0">
      {/* Hero Banner - with bestseller on right */}
      <HeroBanner bestseller={bestseller} loading={statsLoading} />

      {/* Stats Banner - thin line with numbers */}
      <StatsBanner
        totalBooks={totalBooks}
        totalGenres={totalGenres}
        totalUsers={totalUsers}
        loading={statsLoading}
      />

      {/* Featured Books Carousel */}
      <BooksCarousel books={books} loading={booksLoading} />
    </div>
  )
}
