interface AddressFieldProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export default function AddressField({
  label,
  placeholder,
  value,
  onChange
}: AddressFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-600 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  )
}
