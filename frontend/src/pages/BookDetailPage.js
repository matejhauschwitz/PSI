import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBookDetail } from '../hooks/useBookDetail';
import BookDetailHeader from '../components/BookDetailHeader';
import CommentsSection from '../components/CommentsSection';
import { authService } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
export default function BookDetailPage() {
    const { book, comments, loading, error, isFavourite, toggleFavourite, addComment } = useBookDetail();
    const { addToCart } = useCart();
    const isAuthenticated = authService.isAuthenticated();
    if (loading) {
        return (_jsx("div", { className: "flex justify-center py-12", children: _jsx("div", { className: "text-stone-600", children: "Na\u010D\u00EDt\u00E1n\u00ED detail\u016F knihy..." }) }));
    }
    if (error || !book) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "text-red-600 mb-4", children: error || 'Kniha nebyla nalezena' }) }));
    }
    const handleAddToCart = () => {
        addToCart(book);
        toast.success(`"${book.title}" přidáno do košíku`);
    };
    return (_jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsx(BookDetailHeader, { book: book, isFavourite: isFavourite, onToggleFavourite: toggleFavourite, onAddToCart: handleAddToCart, isAuthenticated: isAuthenticated }), _jsx(CommentsSection, { bookId: book.id, comments: comments, onAddComment: addComment, isAuthenticated: isAuthenticated })] }));
}
