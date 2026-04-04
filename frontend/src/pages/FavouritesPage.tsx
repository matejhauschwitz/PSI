import { useFavourites } from '../hooks/useFavourites'
import FavouritesBooksGrid from '../components/FavouritesBooksGrid'

export default function FavouritesPage() {
  const { booksResponse, loading, error, loadFavourites, handleRemoveFavourite } =
    useFavourites()

  return (
    <div className="max-w-7xl mx-auto">
      <FavouritesBooksGrid
        booksResponse={booksResponse}
        loading={loading}
        error={error}
        onRemove={handleRemoveFavourite}
        onRetry={loadFavourites}
      />
    </div>
  )
}
