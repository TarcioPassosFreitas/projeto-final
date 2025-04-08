import { Car } from '../../utils/types'

interface CarSelectorProps {
  car: Car | null
}

export default function CarSelector({ car }: CarSelectorProps) {
  if (!car) return null

  return (
    <div className="flex items-center gap-4">
      <img
        src="/assets/background.jpg"
        alt={car.nome}
        className="w-24 h-24 rounded-xl object-cover"
      />
      <div className="text-white">
        <h2 className="text-xl font-bold text-cyan-400">{car.nome}</h2>
        <p className="mt-1 text-sm"><span className="text-white">Battery:</span> {car.bateria}%</p>
        <p className="text-sm"><span className="text-white">Max Speed:</span> {car.velocidade} km/h</p>
      </div>
    </div>
  )
}
