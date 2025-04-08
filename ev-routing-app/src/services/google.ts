export async function getPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; name: string }> {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'))

    service.getDetails({ placeId, fields: ['geometry', 'name'] }, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        resolve({
          name: place.name || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        })
      } else {
        reject(new Error('Erro ao buscar detalhes do local'))
      }
    })
  })
}

