import { Dialog } from '@headlessui/react'

interface TowTruckInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TowTruckInfoModal({ isOpen, onClose }: TowTruckInfoModalProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {}}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
    >
      <Dialog.Panel className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 rounded-2xl shadow-2xl w-[320px] text-center border border-yellow-500">
        <img
          src="/assets/guincho.png"
          alt="Guincho"
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h2 className="text-yellow-400 text-xl font-bold mb-2">Chame um guincho</h2>
        <p className="text-neutral-300 text-sm mb-2">
          Número: <span className="font-bold text-white">1111111111</span>
        </p>
        <p className="text-neutral-500 text-xs italic mb-4">
          Muito obrigado por usar o nosso app.
        </p>
        <button
          onClick={onClose}
          className="mt-2 w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full shadow-md transition"
        >
          Muito obrigado
        </button>
      </Dialog.Panel>
    </Dialog>
  )
}
