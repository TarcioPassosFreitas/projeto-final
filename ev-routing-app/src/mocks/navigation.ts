export function getMockNavigation(distance: number) {
  const canComplete = distance <= 7;
  return {
    type: 'NAVIGATION',
    data: {
      can_complete: canComplete,
      message: canComplete
        ? ''
        : 'Você não conseguirá chegar ao destino com essa autonomia.',
      autonomy: 5
    },
    status: {
      code: 0,
      message: 'Sucesso'
    },
    timestamp: new Date().toISOString()
  }
}
