import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'

function HomePage() {
  const bestDealsRef = useRef(null)
  const dailyStaplesRef = useRef(null)

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const bestDealsProducts = [
    { id: 1, discount: 20, brand: 'fresho!', title: 'Organic Apples', price: '50.00', oldPrice: '70.00' },
    { id: 2, discount: 15, brand: 'fresho!', title: 'Fresh Bananas - Robusta', price: '40.00', oldPrice: '55.00' },
    { id: 3, discount: 25, brand: 'Amul', title: 'Butter - Salted', price: '45.00', oldPrice: '60.00' },
    { id: 4, discount: 10, brand: 'Mother Dairy', title: 'Milk - Toned', price: '28.00', oldPrice: '32.00' },
    { id: 5, discount: 30, brand: 'Britannia', title: 'Bread - Whole Wheat', price: '35.00', oldPrice: '50.00' },
    { id: 6, discount: 18, brand: 'Nestle', title: 'Maggi Noodles', price: '12.00', oldPrice: '15.00' },
  ]

  const dailyStaplesProducts = [
    { id: 7, brand: 'Tata', title: 'Salt - Iodised', price: '22.00' },
    { id: 8, brand: 'Fortune', title: 'Rice - Basmati', price: '180.00', oldPrice: '200.00' },
    { id: 9, brand: 'Aashirvaad', title: 'Atta - Whole Wheat', price: '210.00' },
    { id: 10, brand: 'Tata', title: 'Tea - Premium', price: '140.00', oldPrice: '160.00' },
    { id: 11, brand: 'Sundrop', title: 'Oil - Sunflower', price: '165.00' },
    { id: 12, brand: 'Everest', title: 'Turmeric Powder', price: '85.00', oldPrice: '95.00' },
  ]

  const categories = [
    { id: 1, name: 'Fruits & Vegetables', image: 'https://placehold.co/250x150/84cc16/ffffff?text=Fruits' },
    { id: 2, name: 'Dairy & Bakery', image: 'https://placehold.co/250x150/1d4a20/ffffff?text=Dairy' },
    { id: 3, name: 'Staples', image: 'https://placehold.co/250x150/84cc16/ffffff?text=Staples' },
    { id: 4, name: 'Snacks', image: 'https://placehold.co/250x150/1d4a20/ffffff?text=Snacks' },
  ]

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
            {bestDealsProducts.map((product) => (
              <div key={product.id} className="flex-none w-64">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </section>

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
            {dailyStaplesProducts.map((product) => (
              <div key={product.id} className="flex-none w-64">
                <ProductCard {...product} />
              </div>
            ))}
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
