import React, { useState, useEffect } from 'react';
import { Package, Clock, User as UserIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { OrderDto, UserDto } from '../interfaces';

export default function UserAccount() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, userRes] = await Promise.all([
          api.get<OrderDto[]>('/orders/user'),
          api.get<UserDto>('/users/profile')
        ]);
        setOrders(ordersRes.data);
        setUser(userRes.data);
      } catch (error) {
        console.error("Failed to fetch account data", error);
        toast.error("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await api.put<UserDto>('/users/profile', user);
      setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My Account</h1>
            <p className="text-stone-500">Manage your orders and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Profile Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile Information
          </h2>
          
          {user && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">First Name</label>
                  <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={user.firstName} onChange={e => setUser({...user, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">Last Name</label>
                  <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={user.lastName} onChange={e => setUser({...user, lastName: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">Email</label>
                <input disabled type="email" className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-500 cursor-not-allowed" value={user.email} />
              </div>

              <div className="pt-4 border-t border-stone-100 mt-4">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Shipping Address</h3>
                <div className="space-y-3">
                  <input required type="text" placeholder="Street Address" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={user.address.street} onChange={e => setUser({...user, address: {...user.address, street: e.target.value}})} />
                  <div className="grid grid-cols-2 gap-3">
                    <input required type="text" placeholder="City" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={user.address.city} onChange={e => setUser({...user, address: {...user.address, city: e.target.value}})} />
                    <input required type="text" placeholder="Zip Code" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={user.address.zipCode} onChange={e => setUser({...user, address: {...user.address, zipCode: e.target.value}})} />
                  </div>
                  <input required type="text" placeholder="Country" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={user.address.country} onChange={e => setUser({...user, address: {...user.address, country: e.target.value}})} />
                </div>
              </div>

              <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors mt-6 disabled:opacity-50">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Orders List */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order History
          </h2>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center">
              <p className="text-stone-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                  <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Order Placed</div>
                      <div className="text-sm font-semibold text-stone-900">{new Date(order.orderDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Total</div>
                      <div className="text-sm font-semibold text-stone-900">${order.totalPrice.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">Status</div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="h-3 w-3" />
                        {order.status}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex items-center gap-4">
                          <img src={item.imageUrl} alt={item.title} className="w-12 h-16 object-cover rounded bg-stone-100" referrerPolicy="no-referrer" />
                          <div>
                            <div className="font-semibold text-stone-900 text-sm">{item.title}</div>
                            <div className="text-xs text-stone-500">{item.author}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
