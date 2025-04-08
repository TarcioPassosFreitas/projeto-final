import axios from 'axios'

export interface FuelStation {
  id: number
  lat: number
  lon: number
  name?: string
}

export async function getFuelStationsAlongRoute(route: [number, number][]): Promise<FuelStation[]> {
  if (route.length === 0) return []

  const lats = route.map(p => p[0])
  const lngs = route.map(p => p[1])
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fuel"](${bbox});
    );
    out body;
  `

  const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
    headers: {
      'Content-Type': 'text/plain'
    }
  })

  return response.data.elements.map((el: any) => ({
    id: el.id,
    lat: el.lat,
    lon: el.lon,
    name: el.tags?.name
  }))
}
