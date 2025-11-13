import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isModalOpen: false,
  isLogin: true, // true for login, false for signup
  user: null,
  isAuthenticated: false,
}

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
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const { openAuthModal, closeAuthModal, toggleAuthMode, loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
