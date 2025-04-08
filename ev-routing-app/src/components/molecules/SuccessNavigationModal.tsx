import { Dialog } from '@headlessui/react'
import { CheckCircle } from 'lucide-react'

interface SuccessNavigationModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
}

export default function SuccessNavigationModal({
  isOpen,
  onClose,
  message
}: SuccessNavigationModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Dialog.Panel className="bg-gradient-to-br from-green-800 via-green-900 to-black p-6 rounded-2xl shadow-2xl w-[320px] text-center border border-green-500">
        <CheckCircle className="text-green-400 mx-auto mb-4" size={40} />
        <h2 className="text-white text-xl font-bold mb-2">Boa viagem!</h2>
        <p className="text-green-300 text-sm mb-2">{message}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full bg-green-600 hover:bg-green-500 transition-colors text-white font-semibold py-2 px-4 rounded-full shadow-lg"
        >
          Entendi
        </button>
      </Dialog.Panel>
    </Dialog>
  )
}
