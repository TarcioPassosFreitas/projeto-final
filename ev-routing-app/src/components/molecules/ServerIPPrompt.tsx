import { useEffect, useState } from 'react'

export default function ServerIPPrompt() {
  const [ip, setIp] = useState(localStorage.getItem('server_ip') || '')
  const [confirmed, setConfirmed] = useState(!!ip)

  useEffect(() => {
    if (confirmed && ip) {
      localStorage.setItem('server_ip', ip)
    }
  }, [confirmed, ip])

  if (confirmed) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-2">Digite o IP do servidor:</h2>
        <input
          className="w-full p-2 rounded bg-neutral-800 outline-none"
          placeholder="Exemplo: 192.168.0.157"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
        />
        <button
          className="mt-4 w-full bg-green-600 hover:bg-green-500 transition rounded py-2 font-semibold"
          onClick={() => ip && setConfirmed(true)}
        >
          Confirmar
        </button>
      </div>
    </div>
  )
}
