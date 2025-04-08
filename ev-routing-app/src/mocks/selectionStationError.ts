export function getMockSelectionStationError() {
  return {
    type: 'SELECTION_STATION',
    data: {
      selected: false,
      message: 'Posto fora de alcance da autonomia atual.',
    },
    status: {
      code: 404,
      message: 'Falha na seleção'
    },
    timestamp: new Date().toISOString()
  }
}
