import { useState } from 'react'
import { AdminBook } from '../services/adminService'

interface BookFormProps {
  book?: AdminBook
  onSubmit: (book: AdminBook) => void
  onCancel: () => void
}

export default function BookForm({ book, onSubmit, onCancel }: BookFormProps) {
  const [form, setForm] = useState<AdminBook>(book || { 
    title: '', 
    subtitle: '',
    authors: '', 
    genre: '',
    description: '',
    isbN10: '', 
    isbN13: '',
    coverImageUrl: '',
    price: 0,
    comments: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(f => ({ 
      ...f, 
      [name]: name === 'price' ? Number(value) : value 
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block mb-1 font-medium">Název</label>
          <input name="title" value={form.title} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Podtitul</label>
          <input name="subtitle" value={form.subtitle} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Autor</label>
            <input name="authors" value={form.authors} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Žánr</label>
            <input name="genre" value={form.genre} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Popis</label>
          <textarea name="description" value={form.description} onChange={handleChange} required className="border rounded px-3 py-2 w-full h-24" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">ISBN10</label>
            <input name="isbN10" value={form.isbN10 || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1 font-medium">ISBN13</label>
            <input name="isbN13" value={form.isbN13 || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">URL obálky</label>
          <input name="coverImageUrl" type="url" value={form.coverImageUrl} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>

        <div>
          <label className="block mb-1 font-medium">Cena (Kč)</label>
          <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Zrušit</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Uložit knihu</button>
      </div>
    </form>
  )
}