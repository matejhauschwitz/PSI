import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { CartProvider } from './context/CartContext'
import './index.css'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BooksPage from './pages/BooksPage'
import BookDetailPage from './pages/BookDetailPage'
import FavouritesPage from './pages/FavouritesPage'
import ProfilePage from './pages/ProfilePage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'

// Components
import Navbar from './components/Navbar'
import Cart from './components/Cart'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-600">Načítání...</div>
      </div>
    )
  }

  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route
                path="/favourites"
                element={isAuthenticated ? <FavouritesPage /> : <Navigate to="/login" />}
              />
              <Route
                path="/profile"
                element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App
