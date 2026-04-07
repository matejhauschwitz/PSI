import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { CartProvider } from './context/CartContext';
import './index.css';
// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import FavouritesPage from './pages/FavouritesPage';
import ProfilePage from './pages/ProfilePage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminPage from './pages/AdminPage';
// Components
import Navbar from './components/Navbar';
import Cart from './components/Cart';
function App() {
    const { isAuthenticated, loading, isAdmin } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-stone-50 flex items-center justify-center", children: _jsx("div", { className: "text-stone-600", children: "Na\u010D\u00EDt\u00E1n\u00ED..." }) }));
    }
    return (_jsx(CartProvider, { children: _jsx(BrowserRouter, { children: _jsxs("div", { className: "min-h-screen bg-stone-50 text-stone-900 font-sans", children: [_jsx(Navbar, {}), _jsx("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/books", element: _jsx(BooksPage, {}) }), _jsx(Route, { path: "/books/:id", element: _jsx(BookDetailPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/cart", element: _jsx(Cart, {}) }), _jsx(Route, { path: "/order-confirmation", element: _jsx(OrderConfirmationPage, {}) }), _jsx(Route, { path: "/favourites", element: isAuthenticated ? _jsx(FavouritesPage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/profile", element: isAuthenticated ? _jsx(ProfilePage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/admin", element: isAuthenticated && isAdmin ? _jsx(AdminPage, {}) : _jsx(Navigate, { to: "/login" }) })] }) })] }) }) }));
}
export default App;
