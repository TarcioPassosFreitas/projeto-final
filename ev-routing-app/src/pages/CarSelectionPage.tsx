import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import Button from '../components/atoms/Button'
import Dropdown from '../components/atoms/Dropdown'
import InputNeon from '../components/atoms/InputNeon'
import CarSelector from '../components/molecules/CarSelector'
import InfoCard from '../components/molecules/InfoCard'
import { sendMessage } from '../services/protocolService'

enum Step { SELECT = 1, DETAILS }

interface Car {
  id: number
  brand: string
  model: string
  battery_capacity: number
  energy_consumption: number
  max_speed: number
  acceleration: number
  nome: string
  bateria: number
  velocidade: number
}

interface Station {
  id_station: string
  name_station: string
  address: string
  latitude: number
  longitude: number
  number_of_simultaneous_vehicles: number
}

export default function CarSelectionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(Step.SELECT)
  const [cars, setCars] = useState<Car[]>([])
  const [selected, setSelected] = useState('')
  const [name, setName] = useState('')
  const [batteryLevel, setBatteryLevel] = useState('100')

  useEffect(() => {
  async function fetchStartData() {
    const response = await sendMessage('START', {})

    console.log('[DEBUG] 🚀 Dado bruto recebido do START:', response)

    if (!response?.data) {
      console.error('[ERRO] ❌ Nenhum dado no response.data. Verifique o backend ou o mock.')
      return
    }

      const carModels: Car[] = Object.entries(response.data.car_models).map(([id, car]: [string, any]) => ({
        id: parseInt(id),
        brand: car.brand,
        model: car.model,
        battery_capacity: car.battery_capacity,
        energy_consumption: car.energy_consumption,
        max_speed: car.max_speed,
        acceleration: car.acceleration,
        nome: `${car.brand} ${car.model}`,
        bateria: 100,
        velocidade: car.max_speed
      }))

      const stationModels: Station[] = Object.entries(response.data.station_models).map(([id, s]: [string, any]) => ({
        id_station: id,
        name_station: s.name_station,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        number_of_simultaneous_vehicles: s.number_of_simultaneous_vehicles
      }))

      setCars(carModels)
      localStorage.setItem('stations', JSON.stringify(stationModels))
    }

    fetchStartData()
  }, [])

  const selectedCar = cars.find(car => car.nome === selected)

  const goToDetails = () => setStep(Step.DETAILS)

  const submitSelection = async () => {
    if (!selectedCar) return

    const userId = uuid()
    localStorage.setItem('user_name', name)
    localStorage.setItem('selected_car', selected)
    localStorage.setItem('battery_car', batteryLevel)

    const response = await sendMessage('LOGIN', {
      user_name: name,
      selected_car: `${selectedCar.brand} ${selectedCar.model}`,
      battery_car: parseInt(batteryLevel)
    })

    const receivedUserId = response?.data?.user_id ?? userId
    localStorage.setItem('user_id', receivedUserId)

    navigate('/map')
  }

  return (
    <main className="relative bg-parallax min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />

      <InfoCard title={step === Step.SELECT ? "Select your car" : "Confirm your details"}>
        {step === Step.SELECT ? (
          <>
            <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">Select your car</h2>
            <Dropdown
              options={cars.map(c => c.nome)}
              value={selected}
              onChange={setSelected}
            />
            <Button onClick={goToDetails} disabled={!selected}>Confirm</Button>
          </>
        ) : (
          selectedCar && (
            <>
              <CarSelector car={selectedCar} />
              <InputNeon value={name} onChange={setName} placeholder="Name" />

              <div className="mt-4">
                <label className="text-white mb-1 block text-sm">Nível da bateria (1 a 100)</label>
                <div className="max-h-40 overflow-y-auto rounded-xl">
                  <Dropdown
                    options={Array.from({ length: 91 }, (_, i) => `${i + 10}`)}
                    value={batteryLevel}
                    onChange={setBatteryLevel}
                  />
                </div>
              </div>

              <Button onClick={submitSelection} disabled={!name || !batteryLevel}>Confirm</Button>
            </>
          )
        )}
      </InfoCard>
    </main>
  )
}
