import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { BookDto, CommentDto } from '../interfaces';
import { useCart } from '../context/CartContext';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [book, setBook] = useState<BookDto | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const [bookRes, commentsRes] = await Promise.all([
          api.get<BookDto>(`/books/${id}`),
          api.get<CommentDto[]>(`/comments/${id}`)
        ]);
        setBook(bookRes.data);
        setComments(commentsRes.data);
      } catch (error) {
        console.error("Failed to fetch book details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    addToCart(book.id);
    toast.success(`${book.title} added to cart!`);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await api.post<CommentDto>('/comments', {
        bookId: id,
        text: newComment,
        userName: 'Current User', // Mock
        rating: rating
      });
      setComments([...comments, res.data]);
      setNewComment('');
      setRating(5);
      setIsReviewModalOpen(false);
      toast.success('Hodnocení bylo úspěšně přidáno!');
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error('Nepodařilo se přidat hodnocení.');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (!book) return <div className="text-center py-12 text-stone-500">Book not found</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to books</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden mb-12">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-stone-100 p-8 flex items-center justify-center">
            <img src={book.imageUrl} alt={book.title} className="w-full max-w-xs rounded-lg shadow-lg" referrerPolicy="no-referrer" />
          </div>
          <div className="md:w-2/3 p-8 md:p-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full">{book.genre}</span>
              <div className="flex items-center text-amber-500 text-sm font-medium">
                <Star className="h-4 w-4 fill-current mr-1" />
                {book.rating}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{book.title}</h1>
            <p className="text-xl text-stone-500 mb-6">by {book.author}</p>
            
            <div className="prose prose-stone mb-8">
              <p>{book.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 text-sm text-stone-600 bg-stone-50 p-4 rounded-2xl">
              <div><span className="font-medium text-stone-900">Published:</span> {book.publishedYear}</div>
              <div><span className="font-medium text-stone-900">ISBN:</span> {book.isbn}</div>
              <div><span className="font-medium text-stone-900">Stock:</span> {book.stock > 0 ? `${book.stock} available` : <span className="text-red-500">Out of stock</span>}</div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-stone-100">
              <div className="text-3xl font-bold text-stone-900">${book.price.toFixed(2)}</div>
              <button 
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-900">Reviews & Comments</h2>
          {token ? (
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Přidat hodnocení
            </button>
          ) : (
            <p className="text-sm text-stone-500">Přihlaste se pro přidání hodnocení.</p>
          )}
        </div>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-stone-500 text-center py-4">No comments yet. Be the first to review!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="border-b border-stone-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-900">{comment.userName}</span>
                  <span className="text-xs text-stone-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < comment.rating ? 'fill-current' : 'text-stone-200'}`} />
                  ))}
                </div>
                <p className="text-stone-600 text-sm">{comment.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-xl">
            <button 
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-stone-900 mb-6">Přidat hodnocení</h2>
            
            <form onSubmit={handleAddComment}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">Hodnocení</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 focus:outline-none"
                    >
                      <Star 
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-stone-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-stone-700 mb-2">Komentář</label>
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Napište svůj názor na tuto knihu..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Zrušit
                </button>
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  Odeslat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
