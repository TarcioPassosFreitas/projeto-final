import axios from 'axios'

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat,
        lon,
        addressdetails: 1
      },
      headers: {
        'Accept-Language': 'pt-BR'
      }
    })

    return response.data.display_name
  } catch (error) {
    console.error('Erro ao buscar endereço reverso:', error)
    return 'Localização desconhecida'
  }
}
