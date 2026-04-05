export interface ShippingAddress {
  streetAddress: string
  city: string
  zip: string
  country: string
}

interface ShippingAddressFormProps {
  address: ShippingAddress
  onChange: (field: keyof ShippingAddress, value: string) => void
}

export default function ShippingAddressForm({ address, onChange }: ShippingAddressFormProps) {
  return (
    <div>
      <h3 className="font-semibold text-stone-900 mb-3">Doručovací Adresa</h3>
      <div className="space-y-3">
        <input
          required
          type="text"
          placeholder="Ulice a číslo popisné"
          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={address.streetAddress}
          onChange={e => onChange('streetAddress', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="text"
            placeholder="Město"
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={address.city}
            onChange={e => onChange('city', e.target.value)}
          />
          <input
            required
            type="text"
            placeholder="PSČ"
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={address.zip}
            onChange={e => onChange('zip', e.target.value)}
          />
        </div>
        <input
          required
          type="text"
          placeholder="Země"
          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={address.country}
          onChange={e => onChange('country', e.target.value)}
        />
      </div>
    </div>
  )
}
