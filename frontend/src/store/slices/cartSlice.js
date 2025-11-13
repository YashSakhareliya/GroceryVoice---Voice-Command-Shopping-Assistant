import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
}

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
    },
    removeFromCart: (state, action) => {
      const item = state.items.find(item => item.id === action.payload)
      if (item) {
        state.totalItems -= item.quantity
        state.totalPrice -= parseFloat(item.price) * item.quantity
        state.items = state.items.filter(item => item.id !== action.payload)
      }
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
    },
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalPrice = 0
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
