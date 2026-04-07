import { jsx as _jsx } from "react/jsx-runtime";
import { useFavourites } from '../hooks/useFavourites';
import FavouritesBooksGrid from '../components/FavouritesBooksGrid';
export default function FavouritesPage() {
    const { booksResponse, loading, error, loadFavourites, handleRemoveFavourite } = useFavourites();
    return (_jsx("div", { className: "max-w-7xl mx-auto", children: _jsx(FavouritesBooksGrid, { booksResponse: booksResponse, loading: loading, error: error, onRemove: handleRemoveFavourite, onRetry: loadFavourites }) }));
}
