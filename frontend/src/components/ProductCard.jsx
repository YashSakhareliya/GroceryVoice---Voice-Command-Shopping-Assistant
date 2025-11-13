import { Plus } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/slices/cartSlice'

function ProductCard({ 
  id,
  image = 'https://placehold.co/200x200/f8fafc/64748b?text=Item',
  discount,
  brand,
  title,
  price,
  oldPrice,
  category
}) {
  const dispatch = useDispatch()

  const handleAddToCart = () => {
    dispatch(addToCart({ id, image, discount, brand, title, price, oldPrice, category }))
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover"
        />
        {discount && (
          <span className="absolute top-2 left-2 bg-dark-green text-white text-xs font-semibold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Brand */}
        {brand && (
          <p className="text-xs text-gray-500 mb-1">{brand}</p>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">₹{price}</span>
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">₹{oldPrice}</span>
          )}
        </div>

        {/* Add Button */}
        <button 
          onClick={handleAddToCart}
          className="w-full py-2 border border-red-600 text-red-600 rounded-md text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={16} />
          Add
        </button>
      </div>
    </div>
  )
}

export default ProductCard
