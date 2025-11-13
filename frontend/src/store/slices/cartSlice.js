import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '../../services/cartService'

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.getCart()
      return data.shoppingList
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart')
    }
  }
)

export const addToCartAsync = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const data = await cartService.addToCart(productId, quantity)
      return data.shoppingList
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart')
    }
  }
)

export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const data = await cartService.updateQuantity(productId, quantity)
      return data.shoppingList
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quantity')
    }
  }
)

export const removeFromCartAsync = createAsyncThunk(
  'cart/remove',
  async (productId, { rejectWithValue }) => {
    try {
      const data = await cartService.removeFromCart(productId)
      return data.shoppingList
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart')
    }
  }
)

export const clearCartAsync = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartService.clearCart()
      return data.shoppingList
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart')
    }
  }
)

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
}

const calculateTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.finalPrice || item.product?.basePrice || 0
    return sum + (price * item.quantity)
  }, 0)
  return { totalItems, totalPrice }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.items || []
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.items || []
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update quantity
      .addCase(updateQuantityAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.items || []
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
      })
      .addCase(updateQuantityAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Remove from cart
      .addCase(removeFromCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload?.items || []
        const totals = calculateTotals(state.items)
        state.totalItems = totals.totalItems
        state.totalPrice = totals.totalPrice
      })
      .addCase(removeFromCartAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Clear cart
      .addCase(clearCartAsync.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.loading = false
        state.items = []
        state.totalItems = 0
        state.totalPrice = 0
      })
      .addCase(clearCartAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError } = cartSlice.actions
export default cartSlice.reducer
