interface OrderSummaryProps {
  itemsCount: number
  totalPrice: number
  paymentMethod: string
}

const calculateShippingCost = (basePrice: number, paymentMethod: string): { shipping: number; total: number } => {
  let shipping = 0
  let total = basePrice

  switch (paymentMethod) {
    case 'OnDelivery':
      shipping = 50
      total = basePrice + 50
      break
    case 'Transfer':
      shipping = 0
      total = basePrice
      break
    case 'OnlineCard':
      shipping = basePrice * 0.01
      total = basePrice * 1.01
      break
    default:
      total = basePrice
  }

  return { shipping, total }
}

export default function OrderSummary({ itemsCount, totalPrice, paymentMethod }: OrderSummaryProps) {
  const { shipping, total } = calculateShippingCost(totalPrice, paymentMethod)

  return (
    <div className="space-y-4 mb-6 pb-6 border-b border-stone-200">
      <div className="flex justify-between text-stone-600">
        <span>Položky ({itemsCount})</span>
        <span>{totalPrice.toFixed(2)} Kč</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Doprava</span>
        <span>{shipping > 0 ? `+${shipping.toFixed(2)} Kč` : 'Zdarma'}</span>
      </div>
      <div className="flex justify-between pt-2 text-lg font-bold text-stone-900">
        <span>Celkem</span>
        <span className="text-blue-600">{total.toFixed(2)} Kč</span>
      </div>
    </div>
  )
}
