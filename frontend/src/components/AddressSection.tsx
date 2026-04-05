import type { Address } from '../types'
import AddressField from './AddressField'

interface AddressSectionProps {
  title: string
  address: Address | undefined
  onChange: (field: keyof Address, value: string) => void
}

export default function AddressSection({
  title,
  address,
  onChange
}: AddressSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-4">
      <h3 className="font-bold text-stone-900 mb-4">
        {title} <span className="text-red-500 text-sm">*</span>
      </h3>

      <div className="space-y-3">
        <AddressField
          label="Ulice"
          placeholder="Ulice"
          value={address?.streetAddress || ''}
          onChange={(value) => onChange('streetAddress', value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <AddressField
            label="Město"
            placeholder="Město"
            value={address?.city || ''}
            onChange={(value) => onChange('city', value)}
          />

          <AddressField
            label="PSČ"
            placeholder="PSČ"
            value={address?.zip || ''}
            onChange={(value) => onChange('zip', value)}
          />
        </div>

        <AddressField
          label="Země"
          placeholder="Země"
          value={address?.country || ''}
          onChange={(value) => onChange('country', value)}
        />
      </div>
    </div>
  )
}
