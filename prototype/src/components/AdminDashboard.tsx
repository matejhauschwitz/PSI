import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/node_modules/react-i18next';
import toast from 'react-hot-toast';
import { Plus, Activity, BookOpen } from 'lucide-react';
import api from '../api';
import { AuditLogDto, BookAddRequest } from '../interfaces';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'books' | 'audit'>('books');
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookForm, setBookForm] = useState<BookAddRequest>({
    title: '', author: '', price: 0, imageUrl: '', genre: '', description: '', publishedYear: 2023, isbn: '', stock: 10
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'Admin') {
      navigate('/');
      toast.error("Access denied");
    }
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get<AuditLogDto[]>('/audit/logs');
      setLogs(res.data);
    } catch (error) {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/books', bookForm);
      toast.success("Book added successfully");
      setBookForm({ title: '', author: '', price: 0, imageUrl: '', genre: '', description: '', publishedYear: 2023, isbn: '', stock: 10 });
    } catch (error) {
      toast.error("Failed to add book");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-6">{t('admin')}</h1>
        <div className="flex gap-4 border-b border-stone-100 pb-4">
          <button 
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'books' ? 'bg-emerald-100 text-emerald-700' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <BookOpen className="h-4 w-4" />
            {t('add_book')}
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === 'audit' ? 'bg-emerald-100 text-emerald-700' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            <Activity className="h-4 w-4" />
            {t('audit_logs')}
          </button>
        </div>
      </div>

      {activeTab === 'books' && (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('add_book')}
          </h2>
          <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('title')}</label>
                <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('author')}</label>
                <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.author} onChange={e => setBookForm({...bookForm, author: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('price')}</label>
                  <input required type="number" step="0.01" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.price} onChange={e => setBookForm({...bookForm, price: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('stock')}</label>
                  <input required type="number" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.stock} onChange={e => setBookForm({...bookForm, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('genre')}</label>
                <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.genre} onChange={e => setBookForm({...bookForm, genre: e.target.value})} />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('image_url')}</label>
                <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.imageUrl} onChange={e => setBookForm({...bookForm, imageUrl: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('published_year')}</label>
                  <input required type="number" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.publishedYear} onChange={e => setBookForm({...bookForm, publishedYear: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('isbn')}</label>
                  <input required type="text" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value={bookForm.isbn} onChange={e => setBookForm({...bookForm, isbn: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">{t('description')}</label>
                <textarea required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24 resize-none" value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="p-4 text-xs font-medium text-stone-500 uppercase">{t('timestamp')}</th>
                    <th className="p-4 text-xs font-medium text-stone-500 uppercase">{t('user')}</th>
                    <th className="p-4 text-xs font-medium text-stone-500 uppercase">{t('action')}</th>
                    <th className="p-4 text-xs font-medium text-stone-500 uppercase">{t('entity')}</th>
                    <th className="p-4 text-xs font-medium text-stone-500 uppercase">{t('details')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-stone-50">
                      <td className="p-4 text-sm text-stone-600">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4 text-sm text-stone-900 font-medium">{log.userId}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' : log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-800'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-stone-600">{log.entity}</td>
                      <td className="p-4 text-xs text-stone-500 max-w-xs truncate">
                        {log.afterState || log.beforeState || '-'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-500">No logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
