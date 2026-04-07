import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { orderService } from '../services/api';
export default function OrderConfirmationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Pokud máme state z navigace, použij ho
        const state = location.state;
        if (state?.order) {
            setOrder(state.order);
            setLoading(false);
            return;
        }
        // Jinak se pokus načíst objednávku z backend
        const fetchOrder = async () => {
            try {
                const orders = await orderService.getOrders();
                // Najdi poslední objednávku
                if (orders && orders.length > 0) {
                    setOrder(orders[orders.length - 1]);
                }
            }
            catch (error) {
                console.error('Failed to load order:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "text-stone-600", children: "Na\u010D\u00EDt\u00E1n\u00ED potvrzen\u00ED objedn\u00E1vky..." }) }));
    }
    if (!order) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-600 mb-6 text-lg", children: "Objedn\u00E1vka se nepoda\u0159ila na\u010D\u00EDst" }), _jsx("button", { onClick: () => navigate('/books'), className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors", children: "Zp\u011Bt na knihy" })] }) }));
    }
    const currentDate = new Date().toLocaleDateString('cs-CZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    // Mapuj enum cisla na nazvy
    const getPaymentMethodName = (method) => {
        const methodMap = {
            '1': '📦 Platba při Doručení',
            '2': '🏦 Bankovní Převod',
            '3': '💳 Karta (Online)',
            OnDelivery: '📦 Platba při Doručení',
            Transfer: '🏦 Bankovní Převod',
            OnlineCard: '💳 Karta (Online)',
        };
        return methodMap[method] || method;
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-stone-200 p-8 mb-8 text-center", children: [_jsx("div", { className: "flex justify-center mb-6", children: _jsx("div", { className: "bg-green-100 rounded-full p-4", children: _jsx(CheckCircle, { className: "h-16 w-16 text-green-600" }) }) }), _jsx("h1", { className: "text-3xl font-bold text-stone-900 mb-2", children: "Objedn\u00E1vka Potvrzena! \u2713" }), _jsx("p", { className: "text-stone-600 mb-6", children: "D\u011Bkujeme za tv\u016Fj n\u00E1kup. Tv\u00E1 objedn\u00E1vka byla \u00FAsp\u011B\u0161n\u011B vytvo\u0159ena." }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8", children: _jsxs("p", { className: "text-blue-900", children: [_jsx("span", { className: "font-semibold", children: "\u010C\u00EDslo objedn\u00E1vky:" }), " #", order.id || 'N/A'] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-stone-200 p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(MapPin, { className: "h-6 w-6 text-blue-600" }), _jsx("h2", { className: "text-xl font-bold text-stone-900", children: "Doru\u010Dovac\u00ED \u00DAdaje" })] }), _jsxs("div", { className: "space-y-2 text-stone-600", children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium text-stone-900", children: "Stanoven\u00FD \u010Das doru\u010Den\u00ED:" }), _jsx("br", {}), "3-5 pracovn\u00EDch dn\u00ED"] }), _jsx("p", { className: "text-sm text-stone-500 mt-4", children: "Sledov\u00E1n\u00ED objedn\u00E1vky bude brzy k dispozici v tv\u00E9m profilu." })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-stone-200 p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(CreditCard, { className: "h-6 w-6 text-blue-600" }), _jsx("h2", { className: "text-xl font-bold text-stone-900", children: "Metoda Platby" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-lg font-semibold text-stone-900", children: getPaymentMethodName(order.paymentMethod || '') }), _jsx("p", { className: "text-sm text-stone-500", children: "Platba bude zpracov\u00E1na v souladu s vybranou metodou." })] })] })] }), _jsxs("div", { className: "bg-stone-50 rounded-lg border border-stone-200 p-6 mb-8", children: [_jsxs("div", { className: "flex items-center justify-between mb-4 pb-4 border-b border-stone-200", children: [_jsx("h2", { className: "text-xl font-bold text-stone-900", children: "Souhrn Objedn\u00E1vky" }), _jsxs("div", { className: "flex items-center gap-2 text-stone-600", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm", children: currentDate })] })] }), _jsxs("div", { className: "space-y-3 mb-6", children: [_jsxs("div", { className: "flex justify-between text-stone-600", children: [_jsx("span", { children: "Po\u010Det polo\u017Eek" }), _jsx("span", { className: "font-medium", children: order.bookIds?.length || 0 })] }), _jsxs("div", { className: "flex justify-between text-stone-600", children: [_jsx("span", { children: "Doprava" }), _jsx("span", { className: "font-medium", children: "Zdarma" })] }), order.totalPrice && (_jsxs("div", { className: "flex justify-between pt-3 border-t border-stone-200", children: [_jsx("span", { className: "font-bold text-stone-900", children: "Celkov\u00E1 Cena" }), _jsxs("span", { className: "font-bold text-lg text-emerald-600", children: [order.totalPrice.toFixed(2), " K\u010D"] })] }))] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: () => navigate('/profile'), className: "w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2", children: [_jsx(Package, { className: "h-5 w-5" }), "J\u00EDt do Profilu - Sledovat Objedn\u00E1vku", _jsx(ArrowRight, { className: "h-5 w-5" })] }), _jsx("button", { onClick: () => navigate('/books'), className: "w-full bg-stone-100 hover:bg-stone-200 text-stone-900 px-6 py-4 rounded-lg font-semibold transition-colors", children: "Pokra\u010Dovat v N\u00E1kupu" })] }), _jsx("div", { className: "mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6 text-center", children: _jsxs("p", { className: "text-blue-900 text-sm", children: ["Potvrzovac\u00ED e-mail byl odesl\u00E1n na tvou registrovanou e-mailovou adresu.", _jsx("br", {}), "Pokud m\u00E1\u0161 jak\u00E9koliv ot\u00E1zky, kontaktuj n\u00E1s na support@knihovna.cz"] }) })] }));
}
