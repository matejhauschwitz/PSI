import { useState } from 'react'
import { Send, X, Star } from 'lucide-react'
import type { Comment } from '../types'

interface CommentsSectionProps {
  bookId: number
  comments: Comment[]
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Promise<void>
  isAuthenticated: boolean
}

export default function CommentsSection({
  bookId,
  comments,
  onAddComment,
  isAuthenticated
}: CommentsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onAddComment({
        bookId,
        comment: commentText,
        rating
      })

      setCommentText('')
      setRating(5)
      setIsModalOpen(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nepodařilo se přidat komentář'
      setError(errorMessage)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Recenze a komentáře</h2>
        {isAuthenticated ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            Přidat recenzi
          </button>
        ) : (
          <p className="text-sm text-stone-500">Přihlaste se pro přidání recenze</p>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-stone-500 text-center py-8">Zatím bez komentářů. Buďte první!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-stone-100 pb-6 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-900">
                  {comment.creatorUserName || 'Anonymní'}
                </span>
                <span className="text-xs text-stone-400">
                  {comment.createdAt
                    ? new Date(comment.createdAt).toLocaleDateString('cs-CZ')
                    : ''}
                </span>
              </div>

              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < (comment.rating || 0)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-stone-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-stone-600 text-sm">{comment.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-stone-900 mb-6">Přidat recenzi</h2>

            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  Hodnocení
                </label>
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

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Komentář
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Sdělte svoje zkušenosti s touto knihou..."
                  className="w-full h-32 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl font-medium transition-colors"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  Odeslat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}