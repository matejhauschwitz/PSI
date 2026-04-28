import { useState } from 'react'
import { AdminBook } from '../services/adminService'

interface BookFormProps {
  book?: AdminBook
  onSubmit: (book: AdminBook) => void
  onCancel: () => void
}

export default function BookForm({ book, onSubmit, onCancel }: BookFormProps) {
  const [form, setForm] = useState<AdminBook>(book || { title: '', authors: '', price: 0, isbn10: '', isbn13: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'price' ? Number(value) : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Název</label>
        <input name="title" value={form.title || ''} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">Autor</label>
        <input name="authors" value={form.authors || ''} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">Cena</label>
        <input name="price" type="number" min="0" step="0.01" value={form.price || 0} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">ISBN10</label>
        <input name="isbn10" value={form.isbn10 || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">ISBN13</label>
        <input name="isbn13" value={form.isbn13 || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Zrušit</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Uložit</button>
      </div>
    </form>
  )
}
