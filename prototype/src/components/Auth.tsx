import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { RegisterRequestDto } from '../interfaces';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    zipCode: '',
    country: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        toast.success('Successfully logged in!');
      } else {
        const req: RegisterRequestDto = {
          email,
          passwordHash: password, // In real app, backend hashes this
          firstName,
          lastName,
          address
        };
        const res = await api.post('/auth/register', req);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        toast.success('Registration successful!');
      }
      navigate('/');
    } catch (error) {
      console.error("Auth failed", error);
      toast.error("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-stone-100 mt-12">
      <h2 className="text-2xl font-bold text-stone-900 mb-6 text-center">
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">First Name</label>
              <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">Last Name</label>
              <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">Email</label>
          <input required type="email" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">Password</label>
          <input required type="password" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {!isLogin && (
          <div className="pt-4 border-t border-stone-100 mt-4">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Address</h3>
            <div className="space-y-3">
              <input required type="text" placeholder="Street Address" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="text" placeholder="City" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                <input required type="text" placeholder="Zip Code" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} />
              </div>
              <input required type="text" placeholder="Country" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} />
            </div>
          </div>
        )}

        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-colors mt-6">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={() => setIsLogin(!isLogin)} className="text-stone-500 hover:text-emerald-600 text-sm font-medium transition-colors">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
