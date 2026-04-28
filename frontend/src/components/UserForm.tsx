import { useState } from 'react'
import { AdminUser } from '../services/adminService'

interface UserFormProps {
  user?: AdminUser
  onSubmit: (user: AdminUser) => void
  onCancel: () => void
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [form, setForm] = useState<AdminUser>(user || { userName: '', name: '', email: '', role: 0 })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'role' ? Number(value) : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Username</label>
        <input name="userName" value={form.userName || ''} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">Jméno</label>
        <input name="name" value={form.name || ''} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input name="email" type="email" value={form.email || ''} onChange={handleChange} required className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1">Role</label>
        <select name="role" value={form.role || 0} onChange={handleChange} className="border rounded px-3 py-2 w-full">
          <option value={0}>User</option>
          <option value={1}>Admin</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Zrušit</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Uložit</button>
      </div>
    </form>
  )
}
