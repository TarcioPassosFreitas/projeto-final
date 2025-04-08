export function getMockLogin() {
  return {
    type: 'LOGIN',
    data: {
      user_id: 'mock-user-id-1234'
    },
    status: {
      code: 200,
      message: 'Sucesso'
    },
    timestamp: new Date().toISOString()
  }
}
