import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useSelector } from 'react-redux'
import { suggestionService } from '../services/suggestionService'
import ProductCard from './ProductCard'

function SubstituteModal({ product, onClose }) {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [substitutes, setSubstitutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [originalProduct, setOriginalProduct] = useState(null)

  useEffect(() => {
    const fetchSubstitutes = async () => {
      try {
        setLoading(true)
        const data = await suggestionService.getSubstitutes(product._id)
        setSubstitutes(data.suggestions || [])
        setOriginalProduct(data.originalProduct || product)
      } catch (error) {
        console.error('Error fetching substitutes:', error)
        setSubstitutes([])
      } finally {
        setLoading(false)
      }
    }

    if (product?._id) {
      fetchSubstitutes()
    }
  }, [product])

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!product) return null

  return (
    <div 
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-green-500 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Product Out of Stock</h3>
            <p className="text-sm text-red-100 mt-1">
              "{product.name}" is currently unavailable
            </p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-red-700 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading substitute products...</p>
            </div>
          ) : substitutes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 font-medium mb-2">
                No substitute products available at the moment
              </p>
              <p className="text-sm text-gray-500">
                Please check back later or browse similar categories
              </p>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-gray-900 mb-4">
                Available Substitute Products:
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {substitutes.map((substitute) => (
                  <ProductCard key={substitute._id} product={substitute} compact />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubstituteModal
