import { createSlice } from '@reduxjs/toolkit'

// Load initial state from localStorage
const loadCartState = () => {
  try {
    const serializedState = localStorage.getItem('cart')
    if (serializedState === null) {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      }
    }
    return JSON.parse(serializedState)
  } catch (err) {
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    }
  }
}

// Save state to localStorage
const saveCartState = (state) => {
  try {
    const serializedState = JSON.stringify({
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
    })
    localStorage.setItem('cart', serializedState)
  } catch (err) {
    // Ignore write errors
  }
}

const initialState = loadCartState()

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
      state.totalItems += 1
      state.totalPrice += parseFloat(action.payload.price)
      saveCartState(state)
    },
    removeFromCart: (state, action) => {
      const item = state.items.find(item => item.id === action.payload)
      if (item) {
        state.totalItems -= item.quantity
        state.totalPrice -= parseFloat(item.price) * item.quantity
        state.items = state.items.filter(item => item.id !== action.payload)
      }
      saveCartState(state)
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.items.find(item => item.id === id)
      if (item) {
        const diff = quantity - item.quantity
        state.totalItems += diff
        state.totalPrice += parseFloat(item.price) * diff
        item.quantity = quantity
      }
      saveCartState(state)
    },
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
      saveCartState(state)
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
