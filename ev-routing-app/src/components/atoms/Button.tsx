interface Props {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export default function Button({ children, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-4 w-full py-3 rounded-full text-black font-semibold text-lg
        transition-all duration-300 ease-in-out
        ${disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 shadow-lg shadow-cyan-400/30"}`}
    >
      {children}
    </button>
  )
}
