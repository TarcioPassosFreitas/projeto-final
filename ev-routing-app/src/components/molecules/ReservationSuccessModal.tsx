import { Dialog } from '@headlessui/react'

interface Props {
  isOpen: boolean
  message: string
  onProceed: () => void
}

export default function ReservationSuccessModal({ isOpen, message, onProceed }: Props) {
  return (
    <Dialog open={isOpen} onClose={() => {}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <Dialog.Panel className="bg-gradient-to-br from-neutral-800 via-neutral-900 to-black p-6 rounded-2xl shadow-2xl w-[320px] text-center border border-purple-500">
        <h2 className="text-purple-400 text-lg font-bold mb-4">Reserva confirmada</h2>
        <p className="text-white text-sm mb-6">{message}</p>
        <button
          onClick={onProceed}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-full shadow-md transition"
        >
          Prosseguir
        </button>
      </Dialog.Panel>
    </Dialog>
  )
}
