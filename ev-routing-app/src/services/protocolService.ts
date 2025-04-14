import { getMockLogin } from '../mocks/login'
import { getMockNavigation } from '../mocks/navigation'
import { mockPaymentResponse } from '../mocks/payment'
import { getMockSelectionStation } from '../mocks/selectionStation'
import { getMockSelectionStationError } from '../mocks/selectionStationError'
import { getMockStart } from '../mocks/start'
import { VITE_USE_MOCK } from '../utils/constants'
import { socket } from './socket'

export type ProtocolType = 'START' | 'LOGIN' | 'NAVIGATION' | 'SELECTION_STATION' | 'PAYMENT'

interface ProtocolMessage {
  type: ProtocolType
  data: Record<string, any>
  status: {
    code: number
    message: string
  }
  timestamp: string
}

export async function sendMessage(type: ProtocolType, data: Record<string, any>): Promise<any> {
  const payload: ProtocolMessage = {
    type,
    data,
    status: { code: 0, message: 'Sucesso' },
    timestamp: new Date().toISOString()
  }

  console.log(`[${type}-CLIENT]`, payload)

  if (VITE_USE_MOCK) {
    if (type === 'START') {
      const response = getMockStart()
      console.log(`[${type}-SERVIDOR - MOCK]`, response)
      return Promise.resolve(response)
    }

    if (type === 'LOGIN') {
      const response = getMockLogin()
      console.log(`[${type}-SERVIDOR - MOCK]`, response)
      return Promise.resolve(response)
    }

    if (type === 'NAVIGATION') {
      const response = getMockNavigation(data.route_distance)
      console.log(`[${type}-SERVIDOR - MOCK]`, response)
      return Promise.resolve(response)
    }

    if (type === 'SELECTION_STATION') {
      if (data?.list_stations) {
        const response = getMockSelectionStation(data)
        console.log(`[${type}-SERVIDOR - MOCK]`, response)
        return Promise.resolve(response)
      }

      if (data?.id_station === 'station_mock_visual') {
        const response = getMockSelectionStationError()
        console.log(`[${type}-SERVIDOR - MOCK - ERRO]`, response)
        return Promise.resolve(response)
      }
    }

    if (type === 'PAYMENT') {
        const { user_id, id_station, confirmation } = data
        return mockPaymentResponse(id_station, user_id, confirmation)
    }
  }

    console.log(`[EMIT SOCKET] Enviando para backend via socket:\n`, JSON.stringify(payload, null, 2))

    return new Promise((resolve) => {
    socket.emit(type, payload)

    socket.on(type, (response: any) => {
      console.log(`[${type}-SERVIDOR]`, response)

      // 💾 Se conter station_models, salvar no localStorage
      if (response?.data?.station_models) {
        localStorage.setItem('station_models', JSON.stringify(response.data.station_models))
        console.log(`[${type}-STATIONS] 🚀 Salvou station_models no localStorage`)
      }

      resolve(response)
    })
  })
}
