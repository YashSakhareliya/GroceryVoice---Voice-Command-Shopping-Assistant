import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// Load initial state from localStorage
const loadState = () => {
  try {
    const userStr = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (userStr && token) {
      return {
        isModalOpen: false,
        isLogin: true,
        user: JSON.parse(userStr),
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    }
    return {
      isModalOpen: false,
      isLogin: true,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    }
  } catch (err) {
    return {
      isModalOpen: false,
      isLogin: true,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    }
  }
}

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

const initialState = loadState()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.isModalOpen = true
      state.isLogin = action.payload?.isLogin ?? true
      state.error = null
    },
    closeAuthModal: (state) => {
      state.isModalOpen = false
      state.error = null
    },
    toggleAuthMode: (state) => {
      state.isLogin = !state.isLogin
      state.error = null
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      authService.logout()
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.isModalOpen = false
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.isModalOpen = false
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { openAuthModal, closeAuthModal, toggleAuthMode, logout, clearError } = authSlice.actions
export default authSlice.reducer
