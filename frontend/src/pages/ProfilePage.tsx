import { useState, useEffect } from 'react'
import { userService, bookService } from '../services/api'
import type { User, Address } from '../types'
import { Save, AlertCircle, CheckCircle, Package } from 'lucide-react'
import ProfileHeader from '../components/ProfileHeader'
import ProfileFormHeader from '../components/ProfileFormHeader'
import AddressSection from '../components/AddressSection'
import GenreSelector from '../components/GenreSelector'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [genres, setGenres] = useState<string[]>([])

  useEffect(() => {
    loadProfile()
    loadGenres()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userService.getUserDetail()
      setUser(data)
      setError(null)
    } catch (err) {
      setError('Nepodařilo se načíst profil')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadGenres = async () => {
    try {
      const genresList = await bookService.getGenres()
      setGenres(genresList)
    } catch (err) {
      console.error('Error loading genres:', err)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      await userService.updateUser(user)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nepodařilo se uložit profil')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressChange = (
    field: keyof Address,
    value: string,
    type: 'address' | 'billingAddress' = 'address'
  ) => {
    if (!user) return
    setUser({
      ...user,
      [type]: {
        ...user[type],
        [field]: value
      }
    })
  }

  const handleGenreToggle = (genre: string) => {
    if (!user) return
    const current = user.favouriteGerners || []
    const updated = current.includes(genre)
      ? current.filter(g => g !== genre)
      : [...current, genre]
    setUser({ ...user, favouriteGerners: updated })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-stone-600">Načítám profil...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-3xl font-bold text-stone-900">Chyba</h1>
        <p className="text-stone-600">Nepodařilo se načíst profil</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ProfileHeader user={user} />

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">Profil byl úspěšně uložen!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulář - 2 sloupce vlevo */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          <ProfileFormHeader
            user={user}
            onNameChange={(value) => setUser({ ...user, name: value })}
            onEmailChange={(value) => setUser({ ...user, email: value })}
            onGenderChange={(value) => setUser({ ...user, isMale: value === 'male' })}
            onBirthdayChange={(value) => setUser({ ...user, birthDay: value })}
          />

          <AddressSection
            title="Adresa doručení"
            address={user.address}
            onChange={(field, value) => handleAddressChange(field, value, 'address')}
          />

          <AddressSection
            title="Fakturační adresa"
            address={user.billingAddress}
            onChange={(field, value) => handleAddressChange(field, value, 'billingAddress')}
          />

          <GenreSelector
            genres={genres}
            selected={user.favouriteGerners || []}
            onToggle={handleGenreToggle}
          />

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Ukládám...' : 'Uložit změny'}
          </button>
        </form>

        {/* Order History - pravý sloupec */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Objednávky
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-stone-600 font-medium">Zatím žádné objednávky</p>
            <p className="text-stone-500 text-sm mt-2">Vaše objednávky se budou zobrazovat zde</p>
          </div>
        </div>
      </div>
    </div>
  )
}
