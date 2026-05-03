import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/api'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    userName: '',
    password: '',
    confirmPassword: '',
    email: '',
    favouriteGerners: [] as string[],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Hesla se neshodují')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...dataToSubmit } = formData;
      
      await authService.register(dataToSubmit)
      
      navigate('/login')
    } catch (err) {
      setError('Registrace se nezdařila. Zkuste jiné jméno.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-lg border border-stone-200">
          {/* Left - Dark info section */}
          <div className="w-full lg:w-1/2 bg-slate-900 text-white px-12 py-16 flex flex-col justify-center">
            <div>
              <h2 className="text-5xl font-black mb-8 leading-tight">Výjimečné čtení čeká</h2>
              <p className="text-xl text-slate-300 mb-12 leading-relaxed font-semibold">
                Vytvořte si účet a vstupte do světa tisíců knih.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-blue-400 font-black text-2xl flex-shrink-0">✓</span>
                  <span className="text-slate-200 text-lg font-medium leading-relaxed">Přístup k plné knihovně</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-blue-400 font-black text-2xl flex-shrink-0">✓</span>
                  <span className="text-slate-200 text-lg font-medium leading-relaxed">Své osobní zbírce výběru</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-blue-400 font-black text-2xl flex-shrink-0">✓</span>
                  <span className="text-slate-200 text-lg font-medium leading-relaxed">Zapojení se v komunitě</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form section */}
          <div className="w-full lg:w-1/2 bg-white px-8 lg:px-12 py-16 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-3">Registrace</h1>
              <p className="text-lg text-slate-600 font-medium">Vytvořte si nový účet</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-base font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                    Jméno
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                    placeholder="Vaše jméno"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                    placeholder="vas@email.cz"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                  Uživatelské jméno
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                  placeholder="uživatelské jméno"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                    Heslo
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                    Potvrzení hesla
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black py-3 px-4 rounded-lg transition-colors uppercase tracking-wide text-base"
              >
                {loading ? 'Vytvářím...' : 'Vytvořit účet'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-base font-medium">
                Už máte účet?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-black">
                  Přihlaste se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
