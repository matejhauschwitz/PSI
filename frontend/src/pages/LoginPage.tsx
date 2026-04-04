import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/api'

export default function LoginPage() {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authService.login(userName, password)
      navigate('/')
    } catch (err) {
      setError('Neplatné přihlašovací údaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-lg border border-stone-200">
          {/* Left - Dark info section */}
          <div className="w-full lg:w-1/2 bg-slate-900 text-white px-12 py-16 flex flex-col justify-center">
            <div>
              <h2 className="text-5xl font-black mb-8 leading-tight">Pokračujte v čtení</h2>
              <p className="text-xl text-slate-300 mb-12 leading-relaxed font-semibold">
                Přihlaste se ke svému účtu a máte přístup k vaší knihovně.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-blue-400 font-black text-2xl flex-shrink-0">✓</span>
                  <span className="text-slate-200 text-lg font-medium leading-relaxed">Veškeré knihy na jednom místě</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-blue-400 font-black text-2xl flex-shrink-0">✓</span>
                  <span className="text-slate-200 text-lg font-medium leading-relaxed">Vaše oblíbené tituly uloženy</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-blue-400 font-black text-2xl flex-shrink-0">✓</span>
                  <span className="text-slate-200 text-lg font-medium leading-relaxed">Vaše komentáře a hodnocení</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Form section */}
          <div className="w-full lg:w-1/2 bg-white px-8 lg:px-12 py-16 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-900 mb-3">Přihlášení</h1>
              <p className="text-lg text-slate-600 font-medium">Zadejte svoje přihlašovací údaje</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-700 text-base font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                  Uživatelské jméno
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                  placeholder="jméno"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-black text-slate-900 mb-3 uppercase tracking-wide">
                  Heslo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-base"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black py-3 px-4 rounded-lg transition-colors uppercase tracking-wide text-base"
              >
                {loading ? 'Přihlašuji...' : 'Přihlásit se'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-base font-medium">
                Nemáte účet?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-black">
                  Registrujte se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
