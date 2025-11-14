import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'
import api from '../services/api'

function HomePage() {
  const bestDealsRef = useRef(null)
  const frequentlyBoughtRef = useRef(null)
  const dailyStaplesRef = useRef(null)

  const [bestDealsProducts, setBestDealsProducts] = useState([])
  const [frequentlyBoughtProducts, setFrequentlyBoughtProducts] = useState([])
  const [dailyStaplesProducts, setDailyStaplesProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch deals from suggestions API
        const dealsResponse = await api.get('/suggestions/deals', { 
          params: { limit: 10 } 
        })
        
        // Fetch frequently purchased items from history
        const historyResponse = await api.get('/suggestions/history', { 
          params: { limit: 10 } 
        }).catch(() => ({ data: { suggestions: [] } })) // Handle unauthorized gracefully
        
        // Fetch regular products for daily staples
        const staplesResponse = await productService.getProducts({ 
          limit: 10,
          tags: 'staples,daily,essential'
        })
        
        setBestDealsProducts(dealsResponse.data.suggestions || [])
        setFrequentlyBoughtProducts(historyResponse.data.suggestions || [])
        setDailyStaplesProducts(staplesResponse.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        // Keep empty arrays if fetch fails
        setBestDealsProducts([])
        setFrequentlyBoughtProducts([])
        setDailyStaplesProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const categories = [
    { id: 1, name: 'Fruits & Vegetables', image: 'https://placehold.co/250x150/84cc16/ffffff?text=Fruits' },
    { id: 2, name: 'Dairy & Bakery', image: 'https://placehold.co/250x150/1d4a20/ffffff?text=Dairy' },
    { id: 3, name: 'Staples', image: 'https://placehold.co/250x150/84cc16/ffffff?text=Staples' },
    { id: 4, name: 'Snacks', image: 'https://placehold.co/250x150/1d4a20/ffffff?text=Snacks' },
  ]

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
      
      <main className="max-w-7xl mx-auto py-6 px-8">
        {/* Best Deals Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Best Deals</h2>
            <div className="flex items-center gap-3">
              <a href="#" className="text-sm text-dark-green font-semibold hover:underline">
                View All
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(bestDealsRef, 'left')}
                  className="bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={() => scroll(bestDealsRef, 'right')}
                  className="bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={bestDealsRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bestDealsProducts.length > 0 ? (
              bestDealsProducts.map((product) => (
                <div key={product._id} className="flex-none w-64">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No deals available at the moment</p>
            )}
          </div>
        </section>

        {/* Frequently Bought Section - Based on History */}
        {frequentlyBoughtProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Frequently Bought by You</h2>
                <p className="text-sm text-gray-600">Based on your order history</p>
              </div>
              <div className="flex items-center gap-3">
                <a href="#" className="text-sm text-dark-green font-semibold hover:underline">
                  View All
                </a>
                <div className="flex gap-2">
                  <button
                    onClick={() => scroll(frequentlyBoughtRef, 'left')}
                    className="bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => scroll(frequentlyBoughtRef, 'right')}
                    className="bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div
              ref={frequentlyBoughtRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {frequentlyBoughtProducts.map((product) => (
                <div key={product._id} className="flex-none w-64">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Your Daily Staples Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Daily Staples</h2>
            <div className="flex items-center gap-3">
              <a href="#" className="text-sm text-dark-green font-semibold hover:underline">
                View All
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(dailyStaplesRef, 'left')}
                  className="bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
                >
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <button
                  onClick={() => scroll(dailyStaplesRef, 'right')}
                  className="bg-white border border-gray-300 rounded-full p-1.5 hover:bg-gray-100"
                >
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          <div
            ref={dailyStaplesRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {dailyStaplesProducts.length > 0 ? (
              dailyStaplesProducts.map((product) => (
                <div key={product._id} className="flex-none w-64">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No products available</p>
            )}
          </div>
        </section>

        {/* Shop by Category Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-4 gap-4">
            {categories.map((category) => (
              <a
                key={category.id}
                href="#"
                className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <h3 className="text-white text-lg font-bold text-center px-2">
                    {category.name}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
