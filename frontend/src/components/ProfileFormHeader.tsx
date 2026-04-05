import type { User } from '../types'
import { Save } from 'lucide-react'

interface ProfileFormHeaderProps {
  user: User
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onGenderChange: (value: string) => void
  onBirthdayChange: (value: string) => void
  onProcessDataChange: (value: boolean) => void
}

export default function ProfileFormHeader({
  user,
  onNameChange,
  onEmailChange,
  onGenderChange,
  onBirthdayChange,
  onProcessDataChange
}: ProfileFormHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-4">
      <h2 className="text-lg font-bold text-stone-900">Základní údaje</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
            Uživatelské jméno
          </label>
          <input
            type="text"
            value={user.userName || ''}
            disabled
            placeholder="Načítám..."
            className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 cursor-not-allowed text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
            Jméno
          </label>
          <input
            type="text"
            value={user.name || ''}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            value={user.email || ''}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
            Pohlaví <span className="text-red-500">*</span>
          </label>
          <select
            value={user.isMale ? 'male' : 'female'}
            onChange={(e) => onGenderChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="male">Muž</option>
            <option value="female">Žena</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
            Narozeniny <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={user.birthDay ? user.birthDay.split('T')[0] : ''}
            onChange={(e) => onBirthdayChange(e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={user.processData || false}
              onChange={(e) => onProcessDataChange(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-stone-700">
              Souhlasím se zpracováním osobních údajů <span className="text-red-500">*</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}
