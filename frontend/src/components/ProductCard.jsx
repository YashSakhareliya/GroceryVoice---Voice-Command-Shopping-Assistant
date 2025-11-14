import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCartAsync, updateQuantityAsync } from '../store/slices/cartSlice'
import SubstituteModal from './SubstituteModal'

function ProductCard({ 
  product,
  compact = false
}) {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [showSubstituteModal, setShowSubstituteModal] = useState(false)
  const cartItem = useSelector((state) => 
    state.cart.items.find(item => item.product?._id === product._id)
  )

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Could show login modal here
      return
    }
    
    // Check if product is out of stock
    if (product.stock === 0) {
      setShowSubstituteModal(true)
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
  const hasDiscount = product.appliedDiscount

  // Conditional sizes based on compact mode
  const imageHeight = compact ? 'h-28' : 'h-48'
  const padding = compact ? 'p-2' : 'p-3'
  const titleSize = compact ? 'text-xs' : 'text-sm'
  const priceSize = compact ? 'text-sm' : 'text-lg'
  const buttonSize = compact ? 'py-1.5 text-xs' : 'py-2 text-sm'
  const iconSize = compact ? 14 : 16
  const badgeSize = compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative">
        <img 
          src={product.imageUrl || 'https://placehold.co/200x200/f8fafc/64748b?text=Product'} 
          alt={product.name}
          className={`w-full ${imageHeight} object-cover ${product.stock === 0 ? 'opacity-50' : ''}`}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center  bg-opacity-40">
            <span className={`bg-red-600 text-white font-bold px-4 py-2 rounded-md ${compact ? 'text-[10px] px-2 py-1' : 'text-sm'}`}>
              OUT OF STOCK
            </span>
          </div>
        )}
        {product.appliedDiscount && product.stock > 0 && (
          <span className={`absolute top-2 left-2 bg-dark-green text-white font-semibold rounded ${badgeSize}`}>
            {product.appliedDiscount.discountValue}{product.appliedDiscount.discountType == "percentage" ? '%' : ''} OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className={padding}>
        {/* Brand */}
        {product.brand && (
          <p className={`text-gray-500 mb-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>{product.brand}</p>
        )}

        {/* Title */}
        <h3 className={`font-medium text-gray-800 mb-2 line-clamp-2 ${titleSize}`}>
          {product.name}
        </h3>

        {/* Price Section */}
        <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
          <span className={`font-bold text-gray-900 ${priceSize}`}>₹{displayPrice}</span>
          {hasDiscount && (
            <span className={`text-gray-400 line-through ${compact ? 'text-[10px]' : 'text-sm'}`}>₹{product.basePrice}</span>
          )}
        </div>

        {/* Add Button or Quantity Controls */}
        {!cartItem ? (
          <button 
            onClick={handleAddToCart}
            className={`w-full border rounded-md font-semibold transition-colors flex items-center justify-center gap-1 ${buttonSize} ${
              product.stock === 0 
                ? 'border-orange-500 text-orange-600 hover:bg-orange-50 cursor-pointer' 
                : 'border-red-600 text-red-600 hover:bg-red-50'
            }`}
          >
            <Plus size={iconSize} />
            {product.stock === 0 ? 'View Substitutes' : 'Add'}
          </button>
        ) : (
          <div className={`flex items-center justify-between bg-red-50 border border-red-600 rounded-md px-2 ${compact ? 'py-1' : 'py-1.5'}`}>
            <button
              onClick={() => handleQuantityChange(-1)}
              className={`flex items-center justify-center text-red-600 hover:bg-red-100 rounded ${compact ? 'w-6 h-6' : 'w-7 h-7'}`}
            >
              <Minus size={iconSize} />
            </button>
            <span className={`font-semibold text-red-600 min-w-6 text-center ${compact ? 'text-xs' : ''}`}>
              {cartItem.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={cartItem.quantity >= product.stock}
              className={`flex items-center justify-center rounded ${compact ? 'w-6 h-6' : 'w-7 h-7'} ${
                cartItem.quantity >= product.stock 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:bg-red-100'
              }`}
            >
              <Plus size={iconSize} />
            </button>
          </div>
        )}
      </div>

      {/* Substitute Modal - only show if not in compact mode to avoid nested modals */}
      {!compact && showSubstituteModal && (
        <SubstituteModal 
          product={product} 
          onClose={() => setShowSubstituteModal(false)} 
        />
      )}
    </div>
  )
}

export default ProductCard

