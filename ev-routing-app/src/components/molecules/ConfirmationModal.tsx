import Modal from 'react-modal'

interface ConfirmationModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

Modal.setAppElement('#root')

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Confirmação"
      className="bg-neutral-900 text-white p-6 rounded-2xl max-w-sm mx-auto mt-40 shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
    >
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <p className="mb-6">{message}</p>
      <div className="flex justify-end gap-4">
        <button onClick={onRequestClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">
          Cancelar
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded bg-orange-500 hover:bg-orange-400">
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
