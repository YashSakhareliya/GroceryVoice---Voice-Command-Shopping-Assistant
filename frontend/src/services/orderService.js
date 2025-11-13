import api from './api'

export const orderService = {
  // Create order from cart
  createOrder: async () => {
    const response = await api.post('/orders')
    return response.data
  },

  // Get user's orders
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params })
    return response.data
  },

  // Get single order by ID
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },
}
