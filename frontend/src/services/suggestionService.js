import api from './api'

export const suggestionService = {
  // Get substitute products for an out-of-stock item
  getSubstitutes: async (productId) => {
    const response = await api.get(`/suggestions/substitutes/${productId}`)
    return response.data
  },

  // Get frequently purchased items
  getHistorySuggestions: async (limit = 10) => {
    const response = await api.get('/suggestions/history', { params: { limit } })
    return response.data
  },

  // Get deals and seasonal items
  getDealsSuggestions: async (limit = 20) => {
    const response = await api.get('/suggestions/deals', { params: { limit } })
    return response.data
  },
}
