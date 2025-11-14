import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'
import api from '../services/api'

function HomePage() {
  const bestDealsRef = useRef(null)
  const frequentlyBoughtRef = useRef(null)
  const dailyStaplesRef = useRef(null)

  const { isAuthenticated } = useSelector((state) => state.auth)
  const [bestDealsProducts, setBestDealsProducts] = useState([])
  const [frequentlyBoughtProducts, setFrequentlyBoughtProducts] = useState([])
  const [dailyStaplesProducts, setDailyStaplesProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch deals from suggestions API (public endpoint)
        const dealsResponse = await api.get('/suggestions/deals', { 
          params: { limit: 10 } 
        }).catch((error) => {
          console.log('Error fetching deals:', error.message)
          return { data: { suggestions: [] } }
        })
        
        // Fetch frequently purchased items from history (only if authenticated)
        let historyResponse = { data: { suggestions: [] } }
        if (isAuthenticated) {
          historyResponse = await api.get('/suggestions/history', { 
            params: { limit: 10 } 
          }).catch((error) => {
            console.log('Error fetching history:', error.message)
            return { data: { suggestions: [] } }
          })
        }
        
        // Fetch regular products for daily staples (public endpoint)
        const staplesResponse = await productService.getProducts({ 
          limit: 10,
          tags: 'staples,daily,essential'
        }).catch((error) => {
          console.log('Error fetching staples:', error.message)
          return { products: [] }
        })
        
        // Fetch categories (public endpoint)
        const categoriesResponse = await productService.getCategories().catch((error) => {
          console.log('Error fetching categories:', error.message)
          return { categories: [] }
        })
        
        setBestDealsProducts(dealsResponse.data.suggestions || [])
        setFrequentlyBoughtProducts(historyResponse.data.suggestions || [])
        setDailyStaplesProducts(staplesResponse.products || [])
        setCategories(categoriesResponse.categories || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        // Keep empty arrays if fetch fails
        setBestDealsProducts([])
        setFrequentlyBoughtProducts([])
        setDailyStaplesProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [isAuthenticated])

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300
      requestAnimationFrame(() => {
        ref.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        })
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <CategoryNav />
        <div className="max-w-7xl mx-auto py-6 px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryNav />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {/* Best Deals Section */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Best Deals</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="#" className="text-xs sm:text-sm text-dark-green font-semibold hover:underline hidden sm:block">
                View All
              </a>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => scroll(bestDealsRef, 'left')}
                  className="bg-white border border-gray-300 rounded-full p-1 sm:p-1.5 hover:bg-gray-100"
                >
                  <ChevronLeft size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => scroll(bestDealsRef, 'right')}
                  className="bg-white border border-gray-300 rounded-full p-1 sm:p-1.5 hover:bg-gray-100"
                >
                  <ChevronRight size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={bestDealsRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 touch-pan-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bestDealsProducts.length > 0 ? (
              bestDealsProducts.map((product) => (
                <div key={product._id} className="flex-none w-44 sm:w-52 md:w-64">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No deals available at the moment</p>
            )}
          </div>
        </section>

        {/* Frequently Bought Section - Based on History */}
        {frequentlyBoughtProducts.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Bought by You</h2>
                <p className="text-xs sm:text-sm text-gray-600">Based on your order history</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <a href="#" className="text-xs sm:text-sm text-dark-green font-semibold hover:underline hidden sm:block">
                  View All
                </a>
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => scroll(frequentlyBoughtRef, 'left')}
                    className="bg-white border border-gray-300 rounded-full p-1 sm:p-1.5 hover:bg-gray-100"
                  >
                    <ChevronLeft size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={() => scroll(frequentlyBoughtRef, 'right')}
                    className="bg-white border border-gray-300 rounded-full p-1 sm:p-1.5 hover:bg-gray-100"
                  >
                    <ChevronRight size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                  </button>
                </div>
              </div>
            </div>
            <div
              ref={frequentlyBoughtRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {frequentlyBoughtProducts.map((product) => (
                <div key={product._id} className="flex-none w-44 sm:w-52 md:w-64">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Daily Staples Section */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Daily Staples</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="#" className="text-xs sm:text-sm text-dark-green font-semibold hover:underline hidden sm:block">
                View All
              </a>
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => scroll(dailyStaplesRef, 'left')}
                  className="bg-white border border-gray-300 rounded-full p-1 sm:p-1.5 hover:bg-gray-100"
                >
                  <ChevronLeft size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => scroll(dailyStaplesRef, 'right')}
                  className="bg-white border border-gray-300 rounded-full p-1 sm:p-1.5 hover:bg-gray-100"
                >
                  <ChevronRight size={16} className="text-gray-600 sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={dailyStaplesRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 touch-pan-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dailyStaplesProducts.length > 0 ? (
              dailyStaplesProducts.map((product) => (
                <div key={product._id} className="flex-none w-44 sm:w-52 md:w-64">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">No products available</p>
            )}
          </div>
        </section>

        {/* Shop by Category Section */}
        <section className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Shop by Category</h2>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <a
                  key={category._id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow text-center group"
                >
                  <div className="text-3xl sm:text-4xl mb-1.5 sm:mb-2">
                    {category.icon || '📦'}
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-dark-green transition-colors">
                    {category.name}
                  </h3>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs sm:text-sm">No categories available</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default HomePage
