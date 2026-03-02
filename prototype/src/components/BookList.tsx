import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Filter, Search } from 'lucide-react';
import api from '../api';
import { BookSimpleDto, BooksResponse } from '../interfaces';

export default function BookList() {
  const [books, setBooks] = useState<BookSimpleDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get<BooksResponse>('/books', {
        params: { page, pageSize: 8, genre, search }
      });
      setBooks(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch (error) {
      console.error("Failed to fetch books", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, genre, search]);

  const genres = ['Classic', 'Dystopian', 'Fantasy', 'Sci-Fi', 'Romance'];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-4 text-stone-800 font-semibold">
            <Filter className="h-5 w-5" />
            <h2>Filters</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-600 mb-2">Search</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Title or author..." 
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Genre</label>
            <div className="space-y-2">
              <button 
                onClick={() => { setGenre(''); setPage(1); }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${genre === '' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                All Genres
              </button>
              {genres.map(g => (
                <button 
                  key={g}
                  onClick={() => { setGenre(g); setPage(1); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${genre === g ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map(book => (
                <Link key={book.id} to={`/books/${book.id}`} className="group bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="aspect-[3/4] overflow-hidden bg-stone-100">
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-emerald-600 mb-1 uppercase tracking-wider">{book.genre}</p>
                    <h3 className="font-semibold text-stone-900 line-clamp-1 mb-1">{book.title}</h3>
                    <p className="text-sm text-stone-500 mb-3">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">${book.price.toFixed(2)}</span>
                      <div className="flex items-center text-amber-500 text-sm">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 font-medium">{book.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {books.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-100">
                <p className="text-stone-500">No books found matching your criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {totalCount > 8 && (
              <div className="mt-8 flex justify-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 flex items-center text-stone-500 text-sm">
                  Page {page} of {Math.ceil(totalCount / 8)}
                </span>
                <button 
                  disabled={page >= Math.ceil(totalCount / 8)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
