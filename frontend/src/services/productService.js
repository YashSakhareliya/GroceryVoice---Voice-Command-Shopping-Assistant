import api from './api'

export const productService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/user/categories')
    return response.data
  },

  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await api.get('/user/products', { params })
    return response.data
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await api.get(`/user/products/${id}`)
    return response.data
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/user/products/category/${categoryId}`, { params })
    return response.data
  },

  // Search products
  searchProducts: async (searchQuery, params = {}) => {
    const response = await api.get('/user/products', {
      params: { search: searchQuery, ...params }
    })
    return response.data
  },

  // Get substitute suggestions for a product
  getSubstitutes: async (productId) => {
    const response = await api.get(`/suggestions/substitutes/${productId}`)
    return response.data
  },
}
