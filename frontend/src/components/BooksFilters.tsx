import { useState, useEffect } from 'react'
import { Filter, Search } from 'lucide-react'
import { bookService } from '../services/api'

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
  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-4 text-stone-800 font-semibold">
          <Filter className="h-5 w-5" />
          <h2>Filtry</h2>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Vyhledávání</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Název knihy..." 
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
          </div>
          <button
            onClick={onSearch}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-sm transition-colors"
          >
            Hledat
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Žánr</label>
          <div className="space-y-2">
            <button 
              onClick={() => onGenreChange('')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${genre === '' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
            >
              Všechny žánry
            </button>
            {genres.map(g => (
              <button 
                key={g}
                onClick={() => onGenreChange(g)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${genre === g ? 'bg-blue-50 text-blue-700 font-medium' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-600 mb-2">Cena (Kč)</label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={onPriceBlur}
              onKeyDown={(e) => e.key === 'Enter' && onPriceBlur()}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={onPriceBlur}
              onKeyDown={(e) => e.key === 'Enter' && onPriceBlur()}
            />
          </div>
        </div>

        <button
          onClick={onClearFilters}
          className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-xl text-sm transition-colors"
        >
          Vymazat filtry
        </button>
      </div>
    </aside>
  )
}