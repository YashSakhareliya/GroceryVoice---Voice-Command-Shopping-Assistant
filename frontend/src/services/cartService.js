import api from './api'

export const cartService = {
  // Get shopping list (cart)
  getCart: async () => {
    const response = await api.get('/shoppinglist')
    return response.data
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, notes = '') => {
    const response = await api.post('/shoppinglist/add', {
      productId,
      quantity,
      notes,
    })
    return response.data
  },

  // Update item quantity
  updateQuantity: async (productId, quantity) => {
    const response = await api.put('/shoppinglist/update', {
      productId,
      quantity,
    })
    return response.data
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await api.delete(`/shoppinglist/remove/${productId}`)
    return response.data
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/shoppinglist/clear')
    return response.data
  },
}
