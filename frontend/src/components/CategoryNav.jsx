import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { productService } from '../services/productService'

function CategoryNav() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const scrollContainerRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const scroll = (direction) => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 300
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      
      setTimeout(() => {
        checkArrows()
      }, 300)
    }
  }

  const checkArrows = () => {
    const container = scrollContainerRef.current
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }

  return (
    <div className="w-full bg-gray-50 py-3 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 relative">
        <div className="flex items-center gap-2">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-4 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          )}

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkArrows}
            className="flex items-center gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className="text-sm text-gray-700 hover:text-dark-green font-medium whitespace-nowrap transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-4 z-10 bg-white shadow-md rounded-full p-1 hover:bg-gray-100"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoryNav
