export default function HomePage() {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">
          Vítejte v Knihovně
        </h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto">
          Největší sbírka knih na jednom místě. Najděte si svou oblíbenou knihu nebo ji zařaďte do objednávky.
        </p>
      </div>

      <div className="pt-4">
        <a
          href="/books"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          Prohlédnout knihy →
        </a>
      </div>
    </div>
  )
}
