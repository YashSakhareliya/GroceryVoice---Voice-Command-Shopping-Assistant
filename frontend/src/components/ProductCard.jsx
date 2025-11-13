import { Plus, Minus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCartAsync, updateQuantityAsync } from '../store/slices/cartSlice'

function ProductCard({ 
  product
}) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const cartItem = useSelector((state) => 
    state.cart.items.find(item => item.product?._id === product._id)
  )

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Could show login modal here
      return
    }
    dispatch(addToCartAsync({ productId: product._id, quantity: 1 }))
  }

  const handleQuantityChange = (change) => {
    const newQuantity = cartItem.quantity + change
    if (newQuantity > 0) {
      dispatch(updateQuantityAsync({ productId: product._id, quantity: newQuantity }))
    }
  }

  // Calculate display price
  const displayPrice = product.finalPrice || product.basePrice
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.basePrice

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative">
        <img 
          src={product.imageUrl || 'https://placehold.co/200x200/f8fafc/64748b?text=Product'} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.discount && (
          <span className="absolute top-2 left-2 bg-dark-green text-white text-xs font-semibold px-2 py-1 rounded">
            {product.discount}% OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">₹{displayPrice}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">₹{product.basePrice}</span>
          )}
        </div>

        {/* Add Button or Quantity Controls */}
        {!cartItem ? (
          <button 
            onClick={handleAddToCart}
            className="w-full py-2 border border-red-600 text-red-600 rounded-md text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={16} />
            Add
          </button>
        ) : (
          <div className="flex items-center justify-between bg-red-50 border border-red-600 rounded-md px-2 py-1.5">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-100 rounded"
            >
              <Minus size={16} />
            </button>
            <span className="font-semibold text-red-600 min-w-6 text-center">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-100 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductCard

