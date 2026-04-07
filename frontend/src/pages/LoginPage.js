import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
export default function LoginPage() {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authService.login(userName, password);
            navigate('/');
        }
        catch (err) {
            setError('Neplatné přihlašovací údaje');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "flex items-center justify-center py-20 px-4", children: _jsx("div", { className: "w-full max-w-4xl", children: _jsxs("div", { className: "flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-lg border border-stone-200", children: [_jsx("div", { className: "w-full lg:w-1/2 bg-slate-900 text-white px-12 py-16 flex flex-col justify-center", children: _jsxs("div", { children: [_jsx("h2", { className: "text-5xl font-black mb-8 leading-tight", children: "Pokra\u010Dujte v \u010Dten\u00ED" }), _jsx("p", { className: "text-xl text-slate-300 mb-12 leading-relaxed font-semibold", children: "P\u0159ihlaste se ke sv\u00E9mu \u00FA\u010Dtu a m\u00E1te p\u0159\u00EDstup k va\u0161\u00ED knihovn\u011B." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: "text-blue-400 font-black text-2xl flex-shrink-0", children: "\u2713" }), _jsx("span", { className: "text-slate-200 text-lg font-medium leading-relaxed", children: "Ve\u0161ker\u00E9 knihy na jednom m\u00EDst\u011B" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: "text-blue-400 font-black text-2xl flex-shrink-0", children: "\u2713" }), _jsx("span", { className: "text-slate-200 text-lg font-medium leading-relaxed", children: "Va\u0161e obl\u00EDben\u00E9 tituly ulo\u017Eeny" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("span", { className: "text-blue-400 font-black text-2xl flex-shrink-0", children: "\u2713" }), _jsx("span", { className: "text-slate-200 text-lg font-medium leading-relaxed", children: "Va\u0161e koment\u00E1\u0159e a hodnocen\u00ED" })] })] })] }) }), _jsxs("div", { className: "w-full lg:w-1/2 bg-white px-8 lg:px-12 py-16 flex flex-col justify-center", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-black text-slate-900 mb-3", children: "P\u0159ihl\u00E1\u0161en\u00ED" }), _jsx("p", { className: "text-lg text-slate-600 font-medium", children: "Zadejte svoje p\u0159ihla\u0161ovac\u00ED \u00FAdaje" })] }), error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-base font-medium", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "U\u017Eivatelsk\u00E9 jm\u00E9no" }), _jsx("input", { type: "text", value: userName, onChange: (e) => setUserName(e.target.value), className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "jm\u00E9no", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-base font-black text-slate-900 mb-3 uppercase tracking-wide", children: "Heslo" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black py-3 px-4 rounded-lg transition-colors uppercase tracking-wide text-base", children: loading ? 'Přihlašuji...' : 'Přihlásit se' })] }), _jsx("div", { className: "mt-8 text-center", children: _jsxs("p", { className: "text-slate-600 text-base font-medium", children: ["Nem\u00E1te \u00FA\u010Det?", ' ', _jsx(Link, { to: "/register", className: "text-blue-600 hover:text-blue-700 font-black", children: "Registrujte se" })] }) })] })] }) }) }));
}
