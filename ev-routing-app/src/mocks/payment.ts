export const mockPaymentResponse = (
  id_station: string,
  user_id: string,
  confirmation: boolean
) => {
  return {
    type: 'PAYMENT',
    data: {
      user_id,
      id_station,
      confirmation,
      message: confirmation
        ? 'Reserva no posto confirmada.'
        : 'Não foi possível reservar o posto selecionado.'
    },
    status: {
      code: confirmation ? 200 : 403,
      message: confirmation ? 'OK' : 'FORBIDDEN'
    },
    timestamp: new Date().toISOString()
  }
}
