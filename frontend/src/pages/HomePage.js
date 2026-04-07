import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFeaturedBooks } from '../hooks/useFeaturedBooks';
import { useHomeStats } from '../hooks/useHomeStats';
import HeroBanner from '../components/HeroBanner';
import StatsBanner from '../components/StatsBanner';
import BooksCarousel from '../components/BooksCarousel';
export default function HomePage() {
    const { books, loading: booksLoading } = useFeaturedBooks();
    const { totalBooks, totalGenres, totalUsers, bestseller, loading: statsLoading } = useHomeStats();
    return (_jsxs("div", { className: "space-y-0", children: [_jsx(HeroBanner, { bestseller: bestseller, loading: statsLoading }), _jsx(StatsBanner, { totalBooks: totalBooks, totalGenres: totalGenres, totalUsers: totalUsers, loading: statsLoading }), _jsx(BooksCarousel, { books: books, loading: booksLoading })] }));
}
