/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './i18n';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import UserAccount from './components/UserAccount';
import Auth from './components/Auth';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
          <Toaster position="top-center" />
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<BookList />} />
              <Route path="/books/:id" element={<BookDetail />} />
              <Route path="/account" element={<UserAccount />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}
