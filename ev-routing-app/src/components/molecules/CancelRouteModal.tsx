import { Dialog } from '@headlessui/react'

interface CancelRouteModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function CancelRouteModal({ isOpen, onConfirm, onCancel }: CancelRouteModalProps) {
  return (
    <Dialog open={isOpen} onClose={onCancel} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="relative bg-neutral-900 text-white rounded-2xl shadow-lg p-6 w-80 z-50">
        <Dialog.Title className="text-lg font-semibold mb-2">Cancelar rota</Dialog.Title>
        <Dialog.Description className="text-sm text-neutral-300 mb-4">
          Deseja cancelar a rota atual e escolher um novo destino?
        </Dialog.Description>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition"
          >
            Não
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 rounded-lg hover:bg-orange-500 transition font-semibold"
          >
            Sim
          </button>
        </div>
      </div>
    </Dialog>
  )
}
