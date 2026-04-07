import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { userService, bookService, orderService } from '../services/api';
import { Save, AlertCircle, CheckCircle, Package, ShoppingCart } from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader';
import ProfileFormHeader from '../components/ProfileFormHeader';
import AddressSection from '../components/AddressSection';
import GenreSelector from '../components/GenreSelector';
export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [genres, setGenres] = useState([]);
    useEffect(() => {
        loadProfile();
        loadOrders();
        loadGenres();
    }, []);
    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await userService.getUserDetail();
            setUser(data);
            setError(null);
        }
        catch (err) {
            setError('Nepodařilo se načíst profil');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const loadOrders = async () => {
        try {
            const userOrders = await orderService.getOrders();
            setOrders(userOrders);
        }
        catch (err) {
            console.error('Error loading orders:', err);
        }
    };
    const loadGenres = async () => {
        try {
            const genresList = await bookService.getGenres();
            setGenres(genresList);
        }
        catch (err) {
            console.error('Error loading genres:', err);
        }
    };
    const handleSave = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        try {
            setSaving(true);
            setError(null);
            await userService.updateUser(user);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            loadProfile();
        }
        catch (err) {
            console.error('Save error:', err);
            setError(err.response?.data?.message || 'Nepodařilo se uložit profil');
        }
        finally {
            setSaving(false);
        }
    };
    const handleAddressChange = (field, value, type = 'address') => {
        if (!user)
            return;
        const currentAddress = user[type] || {};
        setUser({
            ...user,
            [type]: {
                ...currentAddress,
                [field]: value
            }
        });
    };
    const handleGenreToggle = (genre) => {
        if (!user)
            return;
        const current = user.favouriteGerners || [];
        const updated = current.includes(genre)
            ? current.filter(g => g !== genre)
            : [...current, genre];
        setUser({ ...user, favouriteGerners: updated });
    };
    // Kontrola chybějících údajů potřebných pro nákup
    const getMissingCheckoutData = () => {
        if (!user)
            return [];
        const missing = [];
        if (!user.address?.streetAddress)
            missing.push('domovní adresa');
        if (!user.billingAddress?.streetAddress)
            missing.push('fakturační adresa');
        if (user.isMale === undefined || user.isMale === null)
            missing.push('pohlaví');
        if (!user.birthDay)
            missing.push('datum narození');
        if (!user.processData)
            missing.push('souhlas se zpracováním dat');
        return missing;
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("div", { className: "text-stone-600", children: "Na\u010D\u00EDt\u00E1m profil..." })] }) }));
    }
    if (!user) {
        return (_jsxs("div", { className: "text-center space-y-6 py-12", children: [_jsx("div", { className: "text-5xl mb-4", children: "\u274C" }), _jsx("h1", { className: "text-3xl font-bold text-stone-900", children: "Chyba" }), _jsx("p", { className: "text-stone-600", children: "Nepoda\u0159ilo se na\u010D\u00EDst profil" })] }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsx(ProfileHeader, { user: user }), getMissingCheckoutData().length > 0 && (_jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3", children: [_jsx(ShoppingCart, { className: "h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-amber-900 font-semibold", children: "Pro n\u00E1kup je pot\u0159eba vyplnit:" }), _jsx("p", { className: "text-amber-800 text-sm", children: getMissingCheckoutData().join(', ') })] })] })), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-red-800", children: error })] })), success && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-green-800", children: "Profil byl \u00FAsp\u011B\u0161n\u011B ulo\u017Een!" })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("form", { onSubmit: handleSave, className: "lg:col-span-2 space-y-6", children: [_jsx(ProfileFormHeader, { user: user, onNameChange: (value) => setUser({ ...user, name: value }), onEmailChange: (value) => setUser({ ...user, email: value }), onGenderChange: (value) => setUser({ ...user, isMale: value === 'male' }), onBirthdayChange: (value) => setUser({ ...user, birthDay: value }), onProcessDataChange: (value) => setUser({ ...user, processData: value }) }), _jsx(AddressSection, { title: "Adresa doru\u010Den\u00ED", address: user.address, onChange: (field, value) => handleAddressChange(field, value, 'address') }), _jsx(AddressSection, { title: "Faktura\u010Dn\u00ED adresa", address: user.billingAddress, onChange: (field, value) => handleAddressChange(field, value, 'billingAddress') }), _jsx(GenreSelector, { genres: genres, selected: user.favouriteGerners || [], onToggle: handleGenreToggle }), _jsxs("button", { type: "submit", disabled: saving, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2", children: [_jsx(Save, { className: "h-5 w-5" }), saving ? 'Ukládám...' : 'Uložit změny'] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h2", { className: "text-lg font-bold text-stone-900 flex items-center gap-2", children: [_jsx(Package, { className: "h-5 w-5" }), "Objedn\u00E1vky"] }), orders.length === 0 ? (_jsxs("div", { className: "bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDCE6" }), _jsx("p", { className: "text-stone-600 font-medium", children: "Zat\u00EDm \u017E\u00E1dn\u00E9 objedn\u00E1vky" }), _jsx("p", { className: "text-stone-500 text-sm mt-2", children: "Va\u0161e objedn\u00E1vky se budou zobrazovat zde" })] })) : (_jsx("div", { className: "space-y-3", children: orders.map((order) => {
                                    const statusLabels = {
                                        'Pending': { color: 'bg-yellow-100 text-yellow-800', text: 'Čekající' },
                                        'Processing': { color: 'bg-blue-100 text-blue-800', text: 'Zpracovávání' },
                                        'Completed': { color: 'bg-green-100 text-green-800', text: 'Dokončeno' },
                                        'Cancelled': { color: 'bg-red-100 text-red-800', text: 'Zrušeno' },
                                        'Unknown': { color: 'bg-gray-100 text-gray-800', text: 'Neznámý' },
                                    };
                                    const statusInfo = statusLabels[order.status || 'Unknown'] || { color: 'bg-gray-100 text-gray-800', text: order.status || 'Neznámý' };
                                    return (_jsx("div", { className: "bg-white rounded-xl shadow-sm border border-stone-200 p-4 hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex justify-between items-start gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "font-semibold text-stone-900", children: ["Objedn\u00E1vka #", order.id] }), _jsx("p", { className: "text-sm text-stone-500", children: order.createdAt
                                                                ? new Date(order.createdAt).toLocaleDateString('cs-CZ')
                                                                : 'Dnes' }), _jsxs("p", { className: "text-sm text-stone-600 mt-1", children: [order.books?.length || order.bookIds?.length || 0, " polo\u017Eek"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-bold text-stone-900", children: [order.totalPrice?.toFixed(2) || '0.00', " K\u010D"] }), _jsx("span", { className: `inline-block text-xs px-2 py-1 rounded-full mt-2 font-medium ${statusInfo.color}`, children: statusInfo.text })] })] }) }, order.id));
                                }) }))] })] })] }));
}
