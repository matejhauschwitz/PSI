interface PaymentMethodSelectorProps {
  value: string
  onChange: (method: string) => void
}

const PAYMENT_METHODS = [
  { value: 'OnlineCard', label: '💳 Karta (Online)' },
  { value: 'Transfer', label: '🏦 Bankovní Převod' },
  { value: 'OnDelivery', label: '📦 Platba při Doručení' },
]

export default function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div>
      <label className="block font-semibold text-stone-900 mb-3">Metoda platby</label>
      <div className="space-y-2">
        {PAYMENT_METHODS.map(method => (
          <label key={method.value} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value={method.value}
              checked={value === method.value}
              onChange={e => onChange(e.target.value)}
              className="w-4 h-4 text-emerald-600"
            />
            <span className="text-stone-700">{method.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
