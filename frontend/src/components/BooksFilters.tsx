import { useState, useMemo } from 'react'
import { Filter, Search, X } from 'lucide-react'

interface BooksFiltersProps {
  title: string
  setTitle: (value: string) => void
  genre: string
  setGenre: (value: string) => void
  minPrice: string
  setMinPrice: (value: string) => void
  maxPrice: string
  setMaxPrice: (value: string) => void
  genres: string[]
  onSearch: () => void
  onGenreChange: (value: string) => void
  onPriceBlur: () => void
  onClearFilters: () => void
}

export default function BooksFilters({
  title,
  setTitle,
  genre,
  setGenre,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  genres,
  onSearch,
  onGenreChange,
  onPriceBlur,
  onClearFilters
}: BooksFiltersProps) {
  // Stav pro vyhledávání uvnitř seznamu žánrů
  const [genreSearch, setGenreSearch] = useState('')

  // Filtrování žánrů podle toho, co uživatel píše do mini-searchu
  const filteredGenres = useMemo(() => {
    return genres.filter(g => 
      g.toLowerCase().includes(genreSearch.toLowerCase())
    )
  }, [genres, genreSearch])

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-4 text-stone-800 font-semibold">
          <Filter className="h-5 w-5" />
          <h2>Filtry</h2>
        </div>
        
        {/* Vyhledávání v názvech knih */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Název knihy</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Hledat..." 
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Žánry - Scrollbox s vyhledáváním */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Žánr</label>
          
          {/* Mini-search pro žánry */}
          <div className="relative mb-2">
            <input 
              type="text"
              placeholder="Filtrovat žánry..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-stone-400"
            />
            {genreSearch && (
              <button 
                onClick={() => setGenreSearch('')}
                className="absolute right-2 top-1.5 text-stone-400 hover:text-stone-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Scrollable container */}
          <div className="max-h-48 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-stone-200">
            <button 
              onClick={() => onGenreChange('')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${genre === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              Všechny žánry
            </button>
            
            {filteredGenres.length > 0 ? (
              filteredGenres.map(g => (
                <button 
                  key={g}
                  onClick={() => onGenreChange(g)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${genre === g ? 'bg-blue-50 text-blue-700 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  {g}
                </button>
              ))
            ) : (
              <p className="text-xs text-stone-400 text-center py-2">Žádný žánr nenalezen</p>
            )}
          </div>
        </div>

        {/* Cena */}
        <div className="mb-6 border-t border-stone-100 pt-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Cena (Kč)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Od"
              className="w-1/2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={onPriceBlur}
            />
            <input
              type="number"
              placeholder="Do"
              className="w-1/2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={onPriceBlur}
            />
          </div>
        </div>

        {/* Akční tlačítka */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Aplikovat filtry
          </button>
          <button
            onClick={() => {
              onClearFilters();
              setGenreSearch('');
            }}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-sm transition-colors"
          >
            Vymazat vše
          </button>
        </div>
      </div>
    </aside>
  )
}