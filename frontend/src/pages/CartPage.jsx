import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { removeFromCartAsync, updateQuantityAsync, fetchCart, addToCartAsync } from '../store/slices/cartSlice'
import { openAuthModal } from '../store/slices/authSlice'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import { useEffect, useState } from 'react'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'

function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [substitutes, setSubstitutes] = useState({}) // Store substitutes for each product
  const [loadingSubstitutes, setLoadingSubstitutes] = useState({}) // Track loading state

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ isLogin: true }))
      navigate('/')
    } else {
      // Fetch latest cart from backend
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch, navigate])

  // Fetch substitutes for out-of-stock items
  useEffect(() => {
    const fetchSubstitutesForItems = async () => {
      for (const item of items) {
        const isOutOfStock = item.quantity > item.product.stock
        if (isOutOfStock && !substitutes[item.product._id]) {
          setLoadingSubstitutes(prev => ({ ...prev, [item.product._id]: true }))
          try {
            const data = await productService.getSubstitutes(item.product._id)
            setSubstitutes(prev => ({ ...prev, [item.product._id]: data.suggestions || [] }))
          } catch (error) {
            console.error('Error fetching substitutes:', error)
          } finally {
            setLoadingSubstitutes(prev => ({ ...prev, [item.product._id]: false }))
          }
        }
      }
    }

    if (items.length > 0) {
      fetchSubstitutesForItems()
    }
  }, [items])

  if (!isAuthenticated) {
    return null
  }

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      await dispatch(updateQuantityAsync({ productId, quantity: newQuantity }))
    }
  }

  const handleDelete = async (productId) => {
    await dispatch(removeFromCartAsync(productId))
  }

  const handleAddSubstitute = async (productId) => {
    await dispatch(addToCartAsync({ productId, quantity: 1 }))
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    
    setIsPlacingOrder(true)
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.product._id, // product ID from backend
          quantity: item.quantity
        })),
        totalAmount: totalPrice + deliveryFee
      }
      
      const order = await orderService.createOrder(orderData)
      
      // Show success message
      alert(`Order placed successfully! Order ID: ${order._id}`)
      
      // Navigate to orders page or home
      navigate('/')
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const deliveryFee = totalPrice > 200 ? 0 : 40
  const savings = items.reduce((sum, item) => {
    if (item.product?.hasDiscount) {
      return sum + (parseFloat(item.product.basePrice) - parseFloat(item.product.finalPrice)) * item.quantity
    }
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryNav />

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Basket</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-6">
          <span className="text-sm sm:text-base text-gray-600">Delivery in</span>
          <span className="text-green-600 font-semibold flex items-center gap-1 text-sm sm:text-base">
            ⚡ 9 mins
          </span>
          <span className="sm:ml-auto text-gray-600 text-sm sm:text-base">{totalItems} Products</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="bg-dark-green text-white px-6 py-2 rounded-md hover:bg-opacity-90 text-sm sm:text-base"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="hidden sm:grid bg-gray-100 px-4 sm:px-6 py-3 grid-cols-12 gap-4 font-semibold text-gray-700 text-xs sm:text-sm">
                  <div className="col-span-6">Items</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Sub-total</div>
                </div>

                <div className="divide-y">
                  {items.map((item) => {
                    const isOutOfStock = item.quantity > item.product.stock
                    const itemSubstitutes = substitutes[item.product._id] || []
                    const isLoadingSubstitutes = loadingSubstitutes[item.product._id]
                    
                    return (
                      <div key={item._id}>
                        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center hover:bg-gray-50">
                          <div className="sm:col-span-6 flex items-center gap-3 sm:gap-4">
                            <img
                              src={item.product.imageUrl || 'https://placehold.co/80x80/f8fafc/64748b?text=Item'}
                              alt={item.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">{item.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold text-gray-900 text-sm sm:text-base">₹{item.product.finalPrice}</span>
                                {item.product.hasDiscount && (
                                  <span className="text-xs sm:text-sm text-gray-400 line-through">₹{item.product.basePrice}</span>
                                )}
                              </div>
                              {item.product.hasDiscount && (
                                <p className="text-[10px] sm:text-xs text-green-600 mt-1">
                                  Saved: ₹{((parseFloat(item.product.basePrice) - parseFloat(item.product.finalPrice)) * item.quantity).toFixed(2)}
                                </p>
                              )}
                              {isOutOfStock && (
                                <div className="flex items-center gap-1 mt-2 text-red-600 text-[10px] sm:text-xs font-semibold">
                                  <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5" />
                                  <span>Insufficient Stock (Available: {item.product.stock})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="sm:col-span-3 flex items-center justify-between sm:justify-center gap-2">
                            <span className="text-xs text-gray-500 sm:hidden">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                              >
                                <Minus size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                                disabled={item.quantity >= item.product.stock}
                              >
                                <Plus size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="sm:col-span-3 flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            <span className="font-bold text-gray-900 text-sm sm:text-base">
                              ₹{(parseFloat(item.product.finalPrice) * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleDelete(item.product._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                            </button>
                          </div>
                        </div>

                        {/* Substitute Suggestions */}
                        {isOutOfStock && (
                          <div className="px-4 sm:px-6 pb-3 sm:pb-4 bg-yellow-50 border-t border-yellow-200">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3 pt-2 sm:pt-3">
                              <AlertTriangle size={14} className="text-yellow-600 sm:w-4 sm:h-4" />
                              <h4 className="font-semibold text-xs sm:text-sm text-gray-900">
                                Alternative Products Available
                              </h4>
                            </div>

                            {isLoadingSubstitutes ? (
                              <p className="text-[10px] sm:text-xs text-gray-500">Loading alternatives...</p>
                            ) : itemSubstitutes.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                {itemSubstitutes.slice(0, 4).map((substitute) => (
                                  <div
                                    key={substitute._id}
                                    className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 hover:shadow-md transition-shadow"
                                  >
                                    <img
                                      src={substitute.imageUrl || 'https://placehold.co/100x100/f8fafc/64748b?text=Alt'}
                                      alt={substitute.name}
                                      className="w-full h-16 sm:h-20 object-cover rounded mb-1.5 sm:mb-2"
                                    />
                                    <h5 className="text-[10px] sm:text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                                      {substitute.name}
                                    </h5>
                                    <div className="flex items-center gap-1 mb-1 sm:mb-2">
                                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                                        ₹{substitute.finalPrice}
                                      </span>
                                      {substitute.hasDiscount && (
                                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                          ₹{substitute.basePrice}
                                        </span>
                                      )}
                                    </div>
                                    {substitute.comparison?.cheaper && (
                                      <p className="text-[10px] sm:text-xs text-green-600 mb-1 sm:mb-2">
                                        Save ₹{Math.abs(substitute.comparison.priceDifference).toFixed(2)}
                                      </p>
                                    )}
                                    <button
                                      onClick={() => handleAddSubstitute(substitute._id)}
                                      className="w-full bg-light-green text-white text-[10px] sm:text-xs py-1 sm:py-1.5 rounded hover:bg-opacity-90 transition-colors"
                                    >
                                      Add to Cart
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] sm:text-xs text-gray-500">No alternatives available</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:sticky lg:top-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>

                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-sm sm:text-base">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-sm sm:text-base">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Savings</span>
                      <span className="font-medium text-green-600 text-sm sm:text-base">₹{savings.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 sm:pt-4 mb-3 sm:mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">Total</span>
                    <span className="font-bold text-lg sm:text-xl text-gray-900">
                      ₹{(totalPrice + deliveryFee).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-xs sm:text-sm">Choose delivery type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-2 border-light-green bg-green-50 rounded-lg cursor-pointer">
                      <input type="radio" name="delivery" defaultChecked className="accent-light-green" />
                      <div className="flex-1">
                        <div className="font-semibold text-xs sm:text-sm flex items-center gap-1">
                          ⚡ Get it now
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-600">9 mins</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || items.length === 0}
                  className="w-full bg-brand-red text-white py-2.5 sm:py-3 rounded-md font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>

                {totalPrice < 200 && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Add ₹{(200 - totalPrice).toFixed(2)} more for free delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CartPage
