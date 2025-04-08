export function getMockStart() {
  const mockData = {
    type: 'START',
    data: {
      car_models: {
        'Tesla Model 3': {
          brand: 'Tesla',
          model: 'Model 3',
          battery_capacity: 60,
          energy_consumption: 0.15,
          max_speed: 261,
          acceleration: 3.1
        },
        'Nissan Leaf': {
          brand: 'Nissan',
          model: 'Leaf',
          battery_capacity: 75,
          energy_consumption: 0.15,
          max_speed: 240,
          acceleration: 3.5
        },
        'Chevrolet Bolt EV': {
          brand: 'Chevrolet',
          model: 'Bolt EV',
          battery_capacity: 100,
          energy_consumption: 0.15,
          max_speed: 230,
          acceleration: 4.0
        }
      },
      station_models: {
        '1': {
          name_station: 'EcoCharge Centro',
          address: 'Rua Conselheiro Franco',
          latitude: -12.2550,
          longitude: -38.9650,
          number_of_simultaneous_vehicles: 4
        },
        '2': {
          name_station: 'Posto Visual',
          address: 'Rua Exemplo',
          latitude: -12.258556526480858,
          longitude: -38.97510908334628,
          number_of_simultaneous_vehicles: 2
        }
      }
    },
    status: {
      code: 200,
      message: 'Sucesso'
    },
    timestamp: new Date().toISOString()
  }

  localStorage.setItem('mock_stations', JSON.stringify(mockData.data.station_models))
  return mockData
}
