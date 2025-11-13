import { createSlice } from '@reduxjs/toolkit'

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('auth')
    if (serializedState === null) {
      return {
        isModalOpen: false,
        isLogin: true,
        user: null,
        isAuthenticated: false,
      }
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return {
      isModalOpen: false,
      isLogin: true,
      user: null,
      isAuthenticated: false,
    }
  }
}

const initialState = loadState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.isModalOpen = true
      state.isLogin = action.payload?.isLogin ?? true
    },
    closeAuthModal: (state) => {
      state.isModalOpen = false
    },
    toggleAuthMode: (state) => {
      state.isLogin = !state.isLogin
    },
    loginSuccess: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isModalOpen = false
      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify({
        isModalOpen: false,
        isLogin: true,
        user: action.payload,
        isAuthenticated: true,
      }))
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      // Clear from localStorage
      localStorage.removeItem('auth')
    },
  },
})

export const { openAuthModal, closeAuthModal, toggleAuthMode, loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
