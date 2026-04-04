import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Book } from '../types'

interface HeroBannerProps {
  bestseller: Book | null
  loading: boolean
}

export default function HeroBanner({
  bestseller,
  loading
}: HeroBannerProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('jwt_token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Layout - Left dark section + Right bestseller */}
      <div className="flex flex-col lg:flex-row min-h-[500px] lg:min-h-[600px]">
        {/* Left section - Dark with text */}
        <div className="lg:w-1/2 bg-slate-900 text-white px-6 md:px-12 py-20 flex flex-col justify-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600 w-fit px-4 py-2 font-bold mb-8 text-sm">
            → KNIHOVNA
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 tracking-tight">
            Prohlédni si<br />
            <span className="text-blue-400">nejlepší</span>
            <br />
            knihy
          </h1>

          <p className="text-lg text-slate-300 max-w-md mb-12 leading-relaxed font-medium">
            Najdi si svou oblíbenou knihu ze tisíců dostupných titulů. Čti, recenzuj a sbírej.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-fit">
            <a
              href="/books"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-bold transition-colors text-center uppercase tracking-wide"
            >
              Procházet
            </a>
            {!isLoggedIn ? (
              <a
                href="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 font-bold transition-colors text-center uppercase tracking-wide"
              >
                Přihlásit
              </a>
            ) : (
              <a
                href="/favourites"
                className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 font-bold transition-colors text-center uppercase tracking-wide"
              >
                Mé Oblíbené
              </a>
            )}
          </div>
        </div>

        {/* Right section - Bestseller book with overlay */}
        <div className="lg:w-1/2 bg-slate-200 relative overflow-hidden cursor-pointer group">
          {loading || !bestseller ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <div>Načítám bestseller...</div>
              </div>
            </div>
          ) : (
            <Link to={`/books/${bestseller.id}`} className="block w-full h-full">
              <>
                {/* Book Cover - Full background */}
                {bestseller.coverImageUrl ? (
                  <img
                    src={bestseller.coverImageUrl}
                    alt={bestseller.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <div className="text-6xl mb-4">📚</div>
                    </div>
                  </div>
                )}

                {/* Dark overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {/* Book info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                  <div className="space-y-3">
                    <div className="inline-block bg-blue-600 text-white px-4 py-2 font-bold text-xs uppercase tracking-widest">
                      Bestseller
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black line-clamp-2">
                      {bestseller.title}
                    </h2>
                    
                    <p className="text-sm text-slate-300 font-medium">
                      {bestseller.author}
                    </p>

                    {bestseller.rating && (
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={i < Math.round(bestseller.rating || 0) ? 'text-blue-400' : 'text-slate-400'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="font-bold text-sm">
                          {bestseller.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
