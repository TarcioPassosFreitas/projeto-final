import { AlertTriangle } from 'lucide-react'

interface NavigationWarningModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  autonomy: number | null
}

export default function NavigationWarningModal({
  isOpen,
  onClose,
  message,
  autonomy
}: NavigationWarningModalProps) {
  if (!isOpen) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
      <div className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 rounded-2xl shadow-2xl w-[320px] text-center border border-orange-500">
        <AlertTriangle className="text-yellow-400 mx-auto mb-4" size={40} />
        <h2 className="text-white text-xl font-bold mb-2">Aviso!</h2>
        <p className="text-orange-300 text-sm mb-2">
          {message}
        </p>
        {autonomy !== null && (
          <p className="text-neutral-400 text-xs italic">
            Autonomia atual: {autonomy} km
          </p>
        )}
        <button
          onClick={onClose}
          className="mt-5 w-full bg-orange-600 hover:bg-orange-500 transition-colors text-white font-semibold py-2 px-4 rounded-full shadow-lg"
        >
          Entendi
        </button>
      </div>
    </div>
  )
}
