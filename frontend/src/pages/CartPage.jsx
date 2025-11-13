import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { removeFromCartAsync, updateQuantityAsync, fetchCart } from '../store/slices/cartSlice'
import { openAuthModal } from '../store/slices/authSlice'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import { useEffect, useState } from 'react'
import { orderService } from '../services/orderService'

function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { items, totalItems, totalPrice } = useSelector((state) => state.cart)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ isLogin: true }))
      navigate('/')
    } else {
      // Fetch latest cart from backend
      dispatch(fetchCart())
    }
  }, [isAuthenticated, dispatch, navigate])

  if (!isAuthenticated) {
    return null
  }

  const handleQuantityChange = async (id, currentQuantity, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity > 0) {
      await dispatch(updateQuantityAsync({ id, quantity: newQuantity }))
    }
  }

  const handleDelete = async (id) => {
    await dispatch(removeFromCartAsync(id))
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    
    setIsPlacingOrder(true)
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.id, // product ID from backend
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
    if (item.oldPrice) {
      return sum + (parseFloat(item.oldPrice) - parseFloat(item.price)) * item.quantity
    }
    return sum
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryNav />

      <main className="max-w-7xl mx-auto py-6 px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Basket</h1>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-600">Delivery in</span>
          <span className="text-green-600 font-semibold flex items-center gap-1">
            ⚡ 9 mins
          </span>
          <span className="ml-auto text-gray-600">{totalItems} Products</span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="bg-dark-green text-white px-6 py-2 rounded-md hover:bg-opacity-90"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="bg-gray-100 px-6 py-3 grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm">
                  <div className="col-span-6">Items</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Sub-total</div>
                </div>

                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                      <div className="col-span-6 flex items-center gap-4">
                        <img
                          src={item.image || 'https://placehold.co/80x80/f8fafc/64748b?text=Item'}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-gray-900">₹{item.price}</span>
                            {item.oldPrice && (
                              <span className="text-sm text-gray-400 line-through">₹{item.oldPrice}</span>
                            )}
                          </div>
                          {item.oldPrice && (
                            <p className="text-xs text-green-600 mt-1">
                              Saved: ₹{((parseFloat(item.oldPrice) - parseFloat(item.price)) * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="col-span-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-4">
                        <span className="font-bold text-gray-900">
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Savings</span>
                      <span className="font-medium text-green-600">₹{savings.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      ₹{(totalPrice + deliveryFee).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Choose delivery type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border-2 border-light-green bg-green-50 rounded-lg cursor-pointer">
                      <input type="radio" name="delivery" defaultChecked className="accent-light-green" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm flex items-center gap-1">
                          ⚡ Get it now
                        </div>
                        <div className="text-xs text-gray-600">9 mins</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || items.length === 0}
                  className="w-full bg-brand-red text-white py-3 rounded-md font-semibold hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
