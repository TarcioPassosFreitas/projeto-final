import type { LatLngTuple } from 'leaflet';
import { SOCKET_EVENTS } from '../utils/constants';
import { Car, UserSelection } from '../utils/types';

interface Station { id: number; nome: string; lat: number; long: number }
interface BatteryUpdate { battery: number; currentLocation: LatLngTuple; nearestStation: Station; timeToDestination: number }
interface Warning { message: string; nearestStation?: Station }
interface Arrival { message: string }

const carsMock: Car[] = [
  { id: 1, nome: 'Tesla Model S', bateria: 80, velocidade: 250 },
  { id: 2, nome: 'Nissan Leaf', bateria: 60, velocidade: 150 },
]

const stationsMock: Station[] = [
  { id: 1, nome: 'Posto A', lat: -12.26, long: -38.97 },
  { id: 2, nome: 'Posto B', lat: -12.27, long: -38.98 },
]

type Handler<T = unknown> = (payload: T) => void

class MockSocket {
  private handlers: Record<string, Handler[]> = {}
  private battery = 0
  private intervalId: number | null = null

  on<T>(event: string, handler: Handler<T>) {
    this.handlers[event] = [...(this.handlers[event] ?? []), handler as Handler]
  }
  off(event: string, handler?: Handler) {
    if (!handler) delete this.handlers[event]
    else this.handlers[event] = this.handlers[event]?.filter(h => h !== handler) ?? []
  }

  emit(event: string, payload?: unknown) {
    (this.handlers[event] ?? []).forEach(fn => fn(payload as any))

    switch (event) {
      case SOCKET_EVENTS.INIT:
        setTimeout(() => this.emit(SOCKET_EVENTS.CARS, carsMock), 300)
        break
      case SOCKET_EVENTS.USER_SELECTION:
        const { carroId } = payload as UserSelection
        this.battery = carsMock.find(c => c.id === carroId)?.bateria ?? 0
        setTimeout(() => this.emit(SOCKET_EVENTS.START_ROUTE), 500)
        break
      case SOCKET_EVENTS.START_ROUTE:
        this.startTrajectory()
        break
      case SOCKET_EVENTS.PAYMENT_SUCCESS:
        if (this.intervalId) clearInterval(this.intervalId)
        this.battery = 100
        setTimeout(() => this.emit(SOCKET_EVENTS.ARRIVED, { message: 'Você chegou ao destino! 🎉' } as Arrival), 2000)
        break
    }
    return this
  }

  private startTrajectory() {
    this.intervalId = window.setInterval(() => {
      this.battery -= 10
      const nearest = stationsMock[0]
      this.emit(SOCKET_EVENTS.BATTERY_UPDATE, {
        battery: this.battery,
        currentLocation: [-12.262, -38.957] as LatLngTuple,
        nearestStation: nearest,
        timeToDestination: this.battery * 2,
      } as BatteryUpdate)

      if (this.battery === 30) this.emit(SOCKET_EVENTS.BATTERY_WARNING, { message: 'CORRA ATÉ O POSTO', nearestStation: nearest } as Warning)
      if (this.battery <= 10) {
        this.emit(SOCKET_EVENTS.BATTERY_CRITICAL, { message: 'LIGUE PARA O GUINCHO 00000000' } as Warning)
        if (this.intervalId) clearInterval(this.intervalId)
      }
    }, 1000)
  }
}

export default new MockSocket()
