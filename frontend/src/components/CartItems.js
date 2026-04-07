import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
export default function CartItems({ items, onRemove }) {
    const handleRemove = (item) => {
        onRemove(item.id || 0);
        toast.success(`"${item.title}" odstraněno z košíku`);
    };
    return (_jsx("div", { className: "space-y-4", children: items.map(item => (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-stone-200 p-4 flex items-center gap-6", children: [item.coverImageUrl && (_jsx("img", { src: item.coverImageUrl, alt: item.title, className: "w-20 h-28 object-cover rounded-lg bg-stone-100", referrerPolicy: "no-referrer" })), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-bold text-stone-900 text-lg", children: item.title }), _jsx("p", { className: "text-sm text-stone-500 mb-3", children: item.author }), item.genre && _jsxs("p", { className: "text-xs text-stone-500 mb-2", children: ["\u017D\u00E1nr: ", item.genre] }), _jsx("div", { className: "font-bold text-blue-600 text-lg", children: item.price ? `${item.price.toFixed(2)} Kč` : 'Neuvedeno' })] }), _jsx("button", { onClick: () => handleRemove(item), className: "p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors", title: "Odebrat", children: _jsx(Trash2, { className: "h-5 w-5" }) })] }, item.id))) }));
}
