import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Send, X, Star } from 'lucide-react';
export default function CommentsSection({ bookId, comments, onAddComment, isAuthenticated }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim())
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            await onAddComment({
                bookId,
                comment: commentText,
                rating
            });
            setCommentText('');
            setRating(5);
            setIsModalOpen(false);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Nepodařilo se přidat komentář';
            setError(errorMessage);
            console.error(err);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsx("h2", { className: "text-2xl font-bold text-stone-900", children: "Recenze a koment\u00E1\u0159e" }), isAuthenticated ? (_jsx("button", { onClick: () => setIsModalOpen(true), className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors", children: "P\u0159idat recenzi" })) : (_jsx("p", { className: "text-sm text-stone-500", children: "P\u0159ihlaste se pro p\u0159id\u00E1n\u00ED recenze" }))] }), _jsx("div", { className: "space-y-6", children: comments.length === 0 ? (_jsx("p", { className: "text-stone-500 text-center py-8", children: "Zat\u00EDm bez koment\u00E1\u0159\u016F. Bu\u010Fte prvn\u00ED!" })) : (comments.map((comment) => (_jsxs("div", { className: "border-b border-stone-100 pb-6 last:border-0 last:pb-0", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "font-semibold text-stone-900", children: comment.creatorUserName || 'Anonymní' }), _jsx("span", { className: "text-xs text-stone-400", children: comment.createdAt
                                        ? new Date(comment.createdAt).toLocaleDateString('cs-CZ')
                                        : '' })] }), _jsx("div", { className: "flex items-center gap-1 mb-2", children: [...Array(5)].map((_, i) => (_jsx(Star, { className: `h-3 w-3 ${i < (comment.rating || 0)
                                    ? 'fill-amber-500 text-amber-500'
                                    : 'text-stone-200'}` }, i))) }), _jsx("p", { className: "text-stone-600 text-sm", children: comment.comment })] }, comment.id)))) }), isModalOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-xl", children: [_jsx("button", { onClick: () => setIsModalOpen(false), className: "absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors", children: _jsx(X, { className: "h-6 w-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-stone-900 mb-6", children: "P\u0159idat recenzi" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-stone-700 mb-3", children: "Hodnocen\u00ED" }), _jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => setRating(star), onMouseEnter: () => setHoverRating(star), onMouseLeave: () => setHoverRating(0), className: "p-1 focus:outline-none", children: _jsx(Star, { className: `h-8 w-8 transition-colors ${star <= (hoverRating || rating)
                                                        ? 'fill-amber-500 text-amber-500'
                                                        : 'text-stone-300'}` }) }, star))) })] }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-stone-700 mb-2", children: "Koment\u00E1\u0159" }), _jsx("textarea", { value: commentText, onChange: (e) => setCommentText(e.target.value), placeholder: "Sd\u011Blte svoje zku\u0161enosti s touto knihou...", className: "w-full h-32 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm", children: error })), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-medium transition-colors", children: "Zru\u0161it" }), _jsxs("button", { type: "submit", disabled: isSubmitting || !commentText.trim(), className: "flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Send, { className: "h-4 w-4" }), "Odeslat"] })] })] })] }) }))] }));
}
