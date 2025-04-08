import { Dialog } from '@headlessui/react'
import { Truck } from 'lucide-react'

export default function TowingModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
      <Dialog.Panel className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-[300px] text-center">
        <Truck className="text-yellow-400 animate-bounce mx-auto mb-4" size={40} />
        <p className="text-white font-semibold mb-2">Uma pena! Você não conseguiu chegar ao seu destino.</p>
        <p className="text-neutral-300 text-sm mb-4">Chame o reboque para retornar ao ponto inicial.</p>
        <button
          onClick={onClose}
          className="mt-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full"
        >
          Entendi
        </button>
      </Dialog.Panel>
    </Dialog>
  )
}
