import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        userName: '',
        password: '',
        confirmPassword: '',
        email: '',
        favouriteGerners: [],
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Hesla se neshodují');
            return;
        }
        setLoading(true);
        try {
            await authService.register({
                ...formData,
                confirmPassword: undefined,
            });
            navigate('/login');
        }
        catch (err) {
            setError('Registrace se nezdařila. Zkuste jiné jméno.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "flex items-center justify-center py-20 px-4", children: _jsx("div", { className: "w-full max-w-6xl", children: _jsxs("div", { className: "flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-lg border border-stone-200", children: [_jsx("div", { className: "w-full lg:w-1/2 bg-slate-900 text-white px-12 py-16 flex flex-col justify-center", children: _jsxs("div", { children: [_jsx("h2", { className: "text-5xl font-black mb-8 leading-tight", children: "V\u00FDjime\u010Dn\u00E9 \u010Dten\u00ED \u010Dek\u00E1" }), _jsx("p", { className: "text-xl text-slate-300 mb-12 leading-relaxed font-semibold", children: "Vytvo\u0159te si \u00FA\u010Det a vstupte do sv\u011Bta tis\u00EDc\u016F knih." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: "text-blue-400 font-black text-2xl flex-shrink-0", children: "\u2713" }), _jsx("span", { className: "text-slate-200 text-lg font-medium leading-relaxed", children: "P\u0159\u00EDstup k pln\u00E9 knihovn\u011B" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: "text-blue-400 font-black text-2xl flex-shrink-0", children: "\u2713" }), _jsx("span", { className: "text-slate-200 text-lg font-medium leading-relaxed", children: "Sv\u00E9 osobn\u00ED zb\u00EDrce v\u00FDb\u011Bru" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: "text-blue-400 font-black text-2xl flex-shrink-0", children: "\u2713" }), _jsx("span", { className: "text-slate-200 text-lg font-medium leading-relaxed", children: "Zapojen\u00ED se v komunit\u011B" })] })] })] }) }), _jsxs("div", { className: "w-full lg:w-1/2 bg-white px-8 lg:px-12 py-16 flex flex-col justify-center", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-black text-slate-900 mb-3", children: "Registrace" }), _jsx("p", { className: "text-lg text-slate-600 font-medium", children: "Vytvo\u0159te si nov\u00FD \u00FA\u010Det" })] }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-base font-medium", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "Jm\u00E9no" }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "Va\u0161e jm\u00E9no", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "Email" }), _jsx("input", { type: "email", name: "email", value: formData.email, onChange: handleChange, className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "vas@email.cz" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "U\u017Eivatelsk\u00E9 jm\u00E9no" }), _jsx("input", { type: "text", name: "userName", value: formData.userName, onChange: handleChange, className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "u\u017Eivatelsk\u00E9 jm\u00E9no", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "Heslo" }), _jsx("input", { type: "password", name: "password", value: formData.password, onChange: handleChange, className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "Potvrzen\u00ED hesla" }), _jsx("input", { type: "password", name: "confirmPassword", value: formData.confirmPassword, onChange: handleChange, className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black py-3 px-4 rounded-lg transition-colors uppercase tracking-wide text-base", children: loading ? 'Vytvářím...' : 'Vytvořit účet' })] }), _jsx("div", { className: "mt-8 text-center", children: _jsxs("p", { className: "text-slate-600 text-base font-medium", children: ["U\u017E m\u00E1te \u00FA\u010Det?", ' ', _jsx(Link, { to: "/login", className: "text-blue-600 hover:text-blue-700 font-black", children: "P\u0159ihlaste se" })] }) })] })] }) }) }));
}
