interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function InputNeon({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 rounded-full bg-black/30 text-white placeholder-gray-400 backdrop-blur-md border border-cyan-400/10 shadow-sm shadow-cyan-500/10 outline-none focus:ring-2 focus:ring-cyan-500"
    />
  )
}
