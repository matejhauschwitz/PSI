import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBooksFilter } from '../hooks/useBooksFilter';
import BooksFilters from '../components/BooksFilters';
import BooksGrid from '../components/BooksGrid';
export default function BooksPage() {
    const { booksResponse, loading, error, title, setTitle, genre, setGenre, minPrice, setMinPrice, maxPrice, setMaxPrice, genres, handleSearch, handleGenreChange, handlePriceBlur, clearFilters, hasActiveFilters, loadBooks } = useBooksFilter();
    return (_jsxs("div", { className: "flex flex-col md:flex-row gap-8", children: [_jsx(BooksFilters, { title: title, setTitle: setTitle, genre: genre, setGenre: setGenre, minPrice: minPrice, setMinPrice: setMinPrice, maxPrice: maxPrice, setMaxPrice: setMaxPrice, genres: genres, onSearch: handleSearch, onGenreChange: handleGenreChange, onPriceBlur: handlePriceBlur, onClearFilters: clearFilters }), _jsx(BooksGrid, { booksResponse: booksResponse, loading: loading, error: error, onRetry: loadBooks, hasActiveFilters: hasActiveFilters, onClearFilters: clearFilters })] }));
}
