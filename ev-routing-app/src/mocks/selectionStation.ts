export function getMockSelectionStation(payload: any) {
  const entries = Object.entries(payload.list_stations || {}) as [string, { distance_origin_position: number }][];
  const sorted = entries.sort(([, a], [, b]) => a.distance_origin_position - b.distance_origin_position);
  const closestId = sorted[0]?.[0] || '1';

  return {
    type: 'SELECTION_STATION',
    data: {
      user_id: payload.user_id,
      id_station: closestId,
      price_loading: '2340.00',
      message: ''
    },
    status: {
      code: 200,
      message: 'Sucesso'
    },
    timestamp: new Date().toISOString()
  };
}
