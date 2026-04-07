import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PAYMENT_METHODS = [
    { value: 'OnlineCard', label: '💳 Karta (Online)' },
    { value: 'Transfer', label: '🏦 Bankovní Převod' },
    { value: 'OnDelivery', label: '📦 Platba při Doručení' },
];
export default function PaymentMethodSelector({ value, onChange }) {
    return (_jsxs("div", { children: [_jsx("label", { className: "block font-semibold text-stone-900 mb-3", children: "Metoda platby" }), _jsx("div", { className: "space-y-2", children: PAYMENT_METHODS.map(method => (_jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "radio", name: "payment", value: method.value, checked: value === method.value, onChange: e => onChange(e.target.value), className: "w-4 h-4 text-emerald-600" }), _jsx("span", { className: "text-stone-700", children: method.label })] }, method.value))) })] }));
}
