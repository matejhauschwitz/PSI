import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { orderService, userService } from '../services/api';
import CartItems from './CartItems';
import PaymentMethodSelector from './PaymentMethodSelector';
import ShippingAddressForm from './ShippingAddressForm';
import OrderSummary from './OrderSummary';
export default function Cart() {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState({
        streetAddress: '',
        city: '',
        zip: '',
        country: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('OnlineCard');
    const [processData, setProcessData] = useState(false);
    const totalPrice = getCartTotal();
    useEffect(() => {
        // Načti uživatelský profil a předvyplň adresu
        const loadUserAddress = async () => {
            try {
                const token = localStorage.getItem('jwt_token');
                if (!token)
                    return;
                const user = await userService.getUserDetail();
                if (user.address) {
                    setAddress({
                        streetAddress: user.address.streetAddress || '',
                        city: user.address.city || '',
                        zip: user.address.zip || '',
                        country: user.address.country || '',
                    });
                }
                if (user.processData) {
                    setProcessData(user.processData);
                }
            }
            catch (err) {
                console.error('Error loading user address:', err);
            }
        };
        loadUserAddress();
    }, []);
    const handleRemove = (bookId) => {
        removeFromCart(bookId);
    };
    const validateAddress = () => {
        if (!address.streetAddress || !address.city || !address.zip || !address.country) {
            toast.error('Prosím vyplň všechny údaje o adrese');
            return false;
        }
        return true;
    };
    const validateUserProfile = async () => {
        const user = await userService.getUserDetail();
        const missingData = [];
        if (!user.address?.streetAddress)
            missingData.push('domovní adresa');
        if (!user.billingAddress?.streetAddress)
            missingData.push('fakturační adresa');
        if (user.isMale === undefined || user.isMale === null)
            missingData.push('pohlaví');
        if (!user.birthDay)
            missingData.push('datum narození');
        if (!user.processData)
            missingData.push('souhlas se zpracováním dat');
        if (missingData.length > 0) {
            const message = `Prosím doplň v profilu: ${missingData.join(', ')}`;
            toast.error(message);
            navigate('/profile');
            return false;
        }
        return true;
    };
    const getPaymentMethodValue = () => {
        const paymentMethodMap = {
            OnlineCard: 3,
            Transfer: 2,
            OnDelivery: 1,
        };
        return paymentMethodMap[paymentMethod];
    };
    const calculateTotalWithShipping = () => {
        let total = totalPrice;
        switch (paymentMethod) {
            case 'OnDelivery':
                total = totalPrice + 50;
                break;
            case 'OnlineCard':
                total = totalPrice * 1.01;
                break;
            case 'Transfer':
                total = totalPrice;
                break;
        }
        return total;
    };
    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
            toast.error('Košík je prázdný');
            return;
        }
        if (!processData) {
            toast.error('Prosím souhlaste se zpracováním osobních údajů');
            return;
        }
        if (!validateAddress())
            return;
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            toast.error('Prosím přihlaš se pro nákup');
            navigate('/auth');
            return;
        }
        setLoading(true);
        try {
            if (!(await validateUserProfile())) {
                setLoading(false);
                return;
            }
            const response = await orderService.createOrder({
                bookIds: cartItems.map(item => item.id || 0),
                paymentMethod: getPaymentMethodValue(),
            });
            const orderId = response.data;
            clearCart();
            const order = {
                id: orderId,
                bookIds: cartItems.map(item => item.id || 0),
                paymentMethod: paymentMethod,
                totalPrice: calculateTotalWithShipping(),
                status: 'Pending',
            };
            navigate('/order-confirmation', {
                state: { order },
                replace: true,
            });
        }
        catch (error) {
            console.error('Checkout failed:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Nákup se nezdařil. Zkus to prosím znovu.';
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-stone-900 mb-8", children: "Tv\u016Fj Ko\u0161\u00EDk" }), cartItems.length === 0 ? (_jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-stone-200 p-12 text-center", children: [_jsx("p", { className: "text-stone-500 text-lg mb-6", children: "Tv\u016Fj ko\u0161\u00EDk je pr\u00E1zdn\u00FD." }), _jsx("button", { onClick: () => navigate('/'), className: "bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors", children: "Pokra\u010Dovat v n\u00E1kupu" })] })) : (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx(CartItems, { items: cartItems, onRemove: handleRemove }) }), _jsx("div", { children: _jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-stone-200 p-6 sticky top-24", children: [_jsx("h2", { className: "text-xl font-bold text-stone-900 mb-6", children: "Souhrn Objedn\u00E1vky" }), _jsx(OrderSummary, { itemsCount: cartItems.length, totalPrice: totalPrice, paymentMethod: paymentMethod }), _jsxs("form", { onSubmit: handleCheckout, className: "space-y-6", children: [_jsx(PaymentMethodSelector, { value: paymentMethod, onChange: setPaymentMethod }), _jsx(ShippingAddressForm, { address: address, onChange: (field, value) => setAddress({ ...address, [field]: value }) }), _jsxs("label", { className: "flex items-center gap-3 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: processData, onChange: (e) => setProcessData(e.target.checked), className: "w-4 h-4 accent-blue-600 cursor-pointer" }), _jsxs("span", { className: "text-sm text-stone-700", children: ["Souhlas\u00EDm se zpracov\u00E1n\u00EDm osobn\u00EDch \u00FAdaj\u016F ", _jsx("span", { className: "text-red-500", children: "*" })] })] }), _jsxs("button", { type: "submit", disabled: loading, className: "w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(CreditCard, { className: "h-5 w-5" }), loading ? 'Zpracování...' : 'Potvrdit nákup'] })] })] }) })] }))] }));
}
