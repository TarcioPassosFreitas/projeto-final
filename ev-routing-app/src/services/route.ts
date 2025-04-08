import axios from 'axios'
import type { LatLngTuple } from 'leaflet'

export async function getRouteFromORS(start: LatLngTuple, end: LatLngTuple): Promise<LatLngTuple[]> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY

  if (!apiKey) {
    console.warn('⚠️ VITE_ORS_API_KEY não encontrada!')
    throw new Error('API Key do OpenRouteService não encontrada.')
  }

  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [
          [start[1], start[0]],
          [end[1], end[0]],
        ],
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    const coordinates = response.data.features[0].geometry.coordinates
    return coordinates.map(([lng, lat]: [number, number]) => [lat, lng])
  } catch (error) {
    console.error('Erro ao buscar rota da OpenRouteService:', error)
    throw error
  }
}
