import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-2xl' | 'max-w-5xl' | 'max-w-7xl' | 'max-w-full'
}

export default function Modal({ 
  open, 
  title, 
  onClose, 
  children, 
  maxWidth = 'max-w-md'
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className={`bg-white rounded-lg shadow-lg w-full ${maxWidth} p-6 relative max-h-[90vh] overflow-y-auto`}>
        <button
          className="absolute top-2 right-4 text-3xl text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Zavřít"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-bold mb-4 pr-8">{title}</h2>}
        {children}
      </div>
    </div>
  )
}