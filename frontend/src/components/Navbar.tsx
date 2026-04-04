import { Link } from 'react-router-dom'
import { BookOpen, User, Heart, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
              <BookOpen className="h-6 w-6" />
              <span>Knihovna</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/books" className="text-stone-600 hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
              <BookOpen className="h-5 w-5" />
              <span className="hidden sm:inline">Knihy</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/favourites" className="text-stone-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <Heart className="h-5 w-5" />
                  <span className="hidden sm:inline">Oblíbené</span>
                </Link>
                <Link to="/profile" className="text-stone-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profil</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-stone-600 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Odhlásit</span>
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Link to="/login" className="text-stone-600 hover:text-blue-600 transition-colors font-medium">
                  Přihlášení
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
                  Registrace
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
