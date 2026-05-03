interface StatsBannerProps {
  totalBooks: number
  totalGenres: number
  totalUsers: number
  loading: boolean
}

export default function StatsBanner({
  totalBooks,
  totalGenres,
  totalUsers,
  loading
}: StatsBannerProps) {
  return (
    <div className="bg-white border-t-2 border-slate-200 py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
          {/* Stat 1 */}
          <div className="border-l-4 border-blue-600 pl-4 md:pl-6">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900">
              {loading ? '—' : totalBooks.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2">
              Knih v katalogu
            </div>
          </div>

          {/* Stat 2 */}
          <div className="border-l-4 border-slate-300 pl-4 md:pl-6">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900">
              {loading ? '—' : totalGenres}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2">
              Žánrů
            </div>
          </div>

          {/* Stat 3 */}
          <div className="border-l-4 border-slate-300 pl-4 md:pl-6">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900">
              {loading ? '—' : totalUsers.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2">
              Čtenářů
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
