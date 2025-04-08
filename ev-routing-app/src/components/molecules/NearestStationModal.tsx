import { Dialog } from '@headlessui/react'

interface Props {
  isOpen: boolean
  stationName: string
  onConfirm: () => void
  onReject: () => void
}

export default function NearestStationModal({ isOpen, stationName, onConfirm, onReject }: Props) {
  return (
    <Dialog open={isOpen} onClose={onReject} className="fixed z-50 inset-0 flex items-center justify-center bg-black/70">
      <Dialog.Panel className="bg-neutral-900 p-6 rounded-2xl text-center w-[300px] shadow-lg">
        <Dialog.Title className="text-white text-lg font-semibold mb-4">
          Posto sugerido encontrado
        </Dialog.Title>
        <p className="text-neutral-300 mb-4">Você quer ir para o posto <strong>{stationName}</strong>?</p>
        <div className="flex justify-center gap-4">
          <button onClick={onReject} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full">Não</button>
          <button onClick={onConfirm} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-full">Sim</button>
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}
