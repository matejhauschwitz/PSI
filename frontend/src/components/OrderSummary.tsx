interface OrderSummaryProps {
  itemsCount: number
  totalPrice: number
}

export default function OrderSummary({ itemsCount, totalPrice }: OrderSummaryProps) {
  return (
    <div className="space-y-4 mb-6 pb-6 border-b border-stone-200">
      <div className="flex justify-between text-stone-600">
        <span>Položky ({itemsCount})</span>
        <span>{totalPrice.toFixed(2)} Kč</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Doprava</span>
        <span>Zdarma</span>
      </div>
      <div className="flex justify-between pt-2 text-lg font-bold text-stone-900">
        <span>Celkem</span>
        <span className="text-emerald-600">{totalPrice.toFixed(2)} Kč</span>
      </div>
    </div>
  )
}
