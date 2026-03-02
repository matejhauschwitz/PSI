import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, ShoppingCart, LogOut, ShieldAlert, Globe } from 'lucide-react';
import { useTranslation } from '@/node_modules/react-i18next';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const { cartCount } = useCart();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'cs' ? 'en' : 'cs');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl tracking-tight">
              <BookOpen className="h-6 w-6" />
              <span>BookStore</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={toggleLanguage} className="text-stone-600 hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium text-sm">
              <Globe className="h-4 w-4" />
              {i18n.language.toUpperCase()}
            </button>
            <Link to="/cart" className="text-stone-600 hover:text-emerald-600 transition-colors flex items-center gap-1 relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">{t('cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            {token ? (
              <>
                {role === 'Admin' && (
                  <Link to="/admin" className="text-stone-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                    <ShieldAlert className="h-5 w-5" />
                    <span className="hidden sm:inline">{t('admin')}</span>
                  </Link>
                )}
                <Link to="/account" className="text-stone-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('account')}</span>
                </Link>
                <button onClick={handleLogout} className="text-stone-600 hover:text-red-600 transition-colors flex items-center gap-1">
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </button>
              </>
            ) : (
              <Link to="/auth" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
