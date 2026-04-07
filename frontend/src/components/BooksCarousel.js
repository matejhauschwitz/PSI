import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function BooksCarousel({ books, loading }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const itemsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 4;
    if (loading) {
        return (_jsx("div", { className: "text-center py-12", children: _jsx("div", { className: "text-slate-600", children: "Na\u010D\u00EDt\u00E1m doporu\u010Den\u00E9 knihy..." }) }));
    }
    if (books.length === 0) {
        return null;
    }
    const maxIndex = Math.max(0, books.length - itemsPerPage);
    const hasNavigation = maxIndex > 0;
    const handlePrev = () => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    };
    const handleNext = () => {
        setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    };
    const visibleBooks = books.slice(currentIndex, currentIndex + itemsPerPage);
    return (_jsxs("section", { className: "max-w-7xl mx-auto px-4 md:px-12 py-12 md:py-20", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-black text-slate-900", children: "Doporu\u010Dovan\u00E9 knihy" }), _jsx("p", { className: "text-sm md:text-base text-slate-600 font-medium", children: "Nejl\u00E9pe hodnocen\u00E9 tituly z na\u0161\u00ED sb\u00EDrky" })] }), hasNavigation && (_jsxs("div", { className: "flex gap-2 self-start md:self-auto", children: [_jsx("button", { onClick: handlePrev, disabled: currentIndex === 0, className: "p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "aria-label": "P\u0159edchoz\u00ED", children: _jsx(ChevronLeft, { className: "h-6 w-6 text-slate-900" }) }), _jsx("button", { onClick: handleNext, disabled: currentIndex >= maxIndex, className: "p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors", "aria-label": "Dal\u0161\u00ED", children: _jsx(ChevronRight, { className: "h-6 w-6 text-slate-900" }) })] }))] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6", children: visibleBooks.map((book) => (_jsxs(Link, { to: `/books/${book.id}`, className: "bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group", children: [_jsx("div", { className: "aspect-[3/4] bg-slate-100 overflow-hidden", children: book.coverImageUrl ? (_jsx("img", { src: book.coverImageUrl, alt: book.title, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" })) : (_jsx("div", { className: "w-full h-full flex items-center justify-center text-slate-400", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-4xl mb-2", children: "\uD83D\uDCDA" }), _jsx("div", { className: "text-xs", children: "Bez ob\u00E1lky" })] }) })) }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsx("h3", { className: "font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors", children: book.title }), _jsx("p", { className: "text-sm text-slate-600", children: book.author }), book.genre && (_jsx("div", { className: "inline-block bg-slate-100 text-slate-700 text-xs px-3 py-1 font-semibold uppercase tracking-wide", children: book.genre })), _jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-slate-100", children: [book.rating && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { className: "text-blue-500", children: "\u2605" }), _jsx("span", { className: "font-bold text-sm text-slate-900", children: book.rating.toFixed(1) })] })), book.price && (_jsxs("span", { className: "font-bold text-slate-900", children: [book.price, " K\u010D"] }))] })] })] }, book.id))) }), _jsx("div", { className: "flex items-center justify-center gap-2 mt-8", children: [...Array(Math.ceil(books.length / itemsPerPage))].map((_, i) => (_jsx("button", { onClick: () => setCurrentIndex(i * itemsPerPage), className: `h-2 rounded-full transition-all ${i * itemsPerPage === currentIndex
                        ? 'bg-blue-600 w-8'
                        : 'bg-slate-300 w-2 hover:bg-slate-400'}`, "aria-label": `Jít na stranu ${i + 1}` }, i))) })] }));
}
