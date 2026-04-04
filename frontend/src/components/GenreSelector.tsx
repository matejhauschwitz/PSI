interface GenreSelectorProps {
  genres: string[]
  selected: string[]
  onToggle: (genre: string) => void
}

export default function GenreSelector({
  genres,
  selected,
  onToggle
}: GenreSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-4">
      <h3 className="font-bold text-stone-900 mb-6">Oblíbené žánry</h3>

      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => {
          const isSelected = selected.includes(genre)
          return (
            <button
              key={genre}
              onClick={() => onToggle(genre)}
              className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 hover:bg-blue-700 scale-105'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {isSelected && '✓ '}{genre}
            </button>
          )
        })}
      </div>
    </div>
  )
}
