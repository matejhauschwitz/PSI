import { Trash2 } from 'lucide-react'
import type { Book } from '../types'
import toast from 'react-hot-toast'

interface CartItemsProps {
  items: Book[]
  onRemove: (bookId: number) => void
}

export default function CartItems({ items, onRemove }: CartItemsProps) {
  const handleRemove = (item: Book) => {
    onRemove(item.id || 0)
    toast.success(`"${item.title}" odstraněno z košíku`)
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 flex items-center gap-6"
        >
          {item.coverImageUrl && (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="w-20 h-28 object-cover rounded-lg bg-stone-100"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-stone-900 text-lg">{item.title}</h3>
            <p className="text-sm text-stone-500 mb-3">{item.author}</p>
            {item.genre && <p className="text-xs text-stone-500 mb-2">Žánr: {item.genre}</p>}
            <div className="font-bold text-emerald-600 text-lg">
              {item.price ? `${item.price.toFixed(2)} Kč` : 'Neuvedeno'}
            </div>
          </div>
          <button
            onClick={() => handleRemove(item)}
            className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Odebrat"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  )
}
