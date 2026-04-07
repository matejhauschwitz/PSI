import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const calculateShippingCost = (basePrice, paymentMethod) => {
    let shipping = 0;
    let total = basePrice;
    switch (paymentMethod) {
        case 'OnDelivery':
            shipping = 50;
            total = basePrice + 50;
            break;
        case 'Transfer':
            shipping = 0;
            total = basePrice;
            break;
        case 'OnlineCard':
            shipping = basePrice * 0.01;
            total = basePrice * 1.01;
            break;
        default:
            total = basePrice;
    }
    return { shipping, total };
};
export default function OrderSummary({ itemsCount, totalPrice, paymentMethod }) {
    const { shipping, total } = calculateShippingCost(totalPrice, paymentMethod);
    return (_jsxs("div", { className: "space-y-4 mb-6 pb-6 border-b border-stone-200", children: [_jsxs("div", { className: "flex justify-between text-stone-600", children: [_jsxs("span", { children: ["Polo\u017Eky (", itemsCount, ")"] }), _jsxs("span", { children: [totalPrice.toFixed(2), " K\u010D"] })] }), _jsxs("div", { className: "flex justify-between text-stone-600", children: [_jsx("span", { children: "Doprava" }), _jsx("span", { children: shipping > 0 ? `+${shipping.toFixed(2)} Kč` : 'Zdarma' })] }), _jsxs("div", { className: "flex justify-between pt-2 text-lg font-bold text-stone-900", children: [_jsx("span", { children: "Celkem" }), _jsxs("span", { className: "text-blue-600", children: [total.toFixed(2), " K\u010D"] })] })] }));
}
