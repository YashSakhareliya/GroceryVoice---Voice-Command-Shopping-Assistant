import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if this is a public endpoint
      const publicEndpoints = ['/suggestions/deals', '/products', '/suggestions/substitutes']
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      )
      
      if (!isPublicEndpoint) {
        // Token expired or invalid - only redirect for protected routes
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Don't redirect if already on home page to prevent infinite loop
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
