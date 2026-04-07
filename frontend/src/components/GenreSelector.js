import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function GenreSelector({ genres, selected, onToggle }) {
    return (_jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-4", children: [_jsx("h3", { className: "font-bold text-stone-900 mb-6", children: "Obl\u00EDben\u00E9 \u017E\u00E1nry" }), _jsx("div", { className: "flex flex-wrap gap-3", children: genres.map((genre) => {
                    const isSelected = selected.includes(genre);
                    return (_jsxs("button", { type: "button", onClick: () => onToggle(genre), className: `px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 scale-105'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'}`, children: [isSelected && '✓ ', genre] }, genre));
                }) })] }));
}
