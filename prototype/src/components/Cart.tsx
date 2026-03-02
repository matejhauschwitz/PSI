import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { BookDto, OrderAddRequest } from '../interfaces';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const [cartItems, setCartItems] = useState<BookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getCartItems, removeFromCart, clearCart } = useCart();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    const fetchCart = async () => {
      const cartIds = getCartItems();
      if (cartIds.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      
      try {
        // In a real app, we'd have a batch endpoint or cart endpoint
        const promises = cartIds.map((id: string) => api.get<BookDto>(`/books/${id}`));
        const responses = await Promise.all(promises);
        setCartItems(responses.map(res => res.data));
      } catch (error) {
        console.error("Failed to fetch cart items", error);
        toast.error("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [getCartItems]);

  const handleRemove = (index: number) => {
    const newItems = [...cartItems];
    const removedItem = newItems.splice(index, 1)[0];
    setCartItems(newItems);
    removeFromCart(index);
    toast.success(`${removedItem.title} removed from cart`);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Please login to checkout");
      navigate('/auth');
      return;
    }

    const orderRequest: OrderAddRequest = {
      bookIds: cartItems.map(i => i.id),
      shippingAddress: address,
      totalPrice
    };

    try {
      await api.post('/orders', orderRequest);
      clearCart();
      setCartItems([]);
      toast.success("Order placed successfully!");
      navigate('/account');
    } catch (error) {
      console.error("Checkout failed", error);
      toast.error("Checkout failed. Please try again.");
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center">
          <p className="text-stone-500 text-lg mb-6">Your cart is empty.</p>
          <button onClick={() => navigate('/')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 flex items-center gap-6">
                <img src={item.imageUrl} alt={item.title} className="w-20 h-28 object-cover rounded-lg bg-stone-100" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h3 className="font-bold text-stone-900">{item.title}</h3>
                  <p className="text-sm text-stone-500 mb-2">{item.author}</p>
                  <div className="font-bold text-emerald-600">${item.price.toFixed(2)}</div>
                </div>
                <button 
                  onClick={() => handleRemove(idx)}
                  className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-stone-900 mb-6">Order Summary</h2>
              
              <div className="flex justify-between mb-4 text-stone-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6 text-stone-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between pt-6 border-t border-stone-100 mb-8">
                <span className="font-bold text-stone-900 text-lg">Total</span>
                <span className="font-bold text-emerald-600 text-2xl">${totalPrice.toFixed(2)}</span>
              </div>

              <form onSubmit={handleCheckout}>
                <h3 className="font-semibold text-stone-900 mb-4">Shipping Address</h3>
                <div className="space-y-3 mb-8">
                  <input required type="text" placeholder="Street Address" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="text" placeholder="City" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                    <input required type="text" placeholder="Zip Code" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} />
                  </div>
                  <input required type="text" placeholder="Country" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} />
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-semibold transition-colors">
                  <CreditCard className="h-5 w-5" />
                  Checkout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
