import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'

function CategoryPage() {
  const [expandedSections, setExpandedSections] = useState({
    rating: true,
    brands: true,
    price: true,
    discount: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const products = [
    { id: 1, discount: 20, brand: 'fresho!', title: 'Organic Apples - Red', price: '50.00', oldPrice: '70.00' },
    { id: 2, discount: 15, brand: 'fresho!', title: 'Fresh Bananas - Robusta', price: '40.00', oldPrice: '55.00' },
    { id: 3, discount: 25, brand: 'fresho!', title: 'Tomatoes - Local', price: '25.00', oldPrice: '35.00' },
    { id: 4, discount: 10, brand: 'fresho!', title: 'Onions - Bangalore Rose', price: '30.00', oldPrice: '35.00' },
    { id: 5, brand: 'fresho!', title: 'Potatoes', price: '28.00' },
    { id: 6, discount: 18, brand: 'fresho!', title: 'Carrots - Orange', price: '45.00', oldPrice: '55.00' },
    { id: 7, brand: 'fresho!', title: 'Capsicum - Green', price: '35.00' },
    { id: 8, discount: 12, brand: 'fresho!', title: 'Spinach - Palak', price: '22.00', oldPrice: '25.00' },
    { id: 9, brand: 'fresho!', title: 'Cauliflower', price: '40.00' },
  ]

  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full text-left mb-3"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {expandedSections[sectionKey] ? (
          <ChevronUp size={18} className="text-gray-600" />
        ) : (
          <ChevronDown size={18} className="text-gray-600" />
        )}
      </button>
      {expandedSections[sectionKey] && (
        <div className="space-y-2">
          {children}
        </div>
      )}
    </div>
  )

  const CheckboxOption = ({ label, count }) => (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
      <input type="checkbox" className="w-4 h-4 accent-dark-green" />
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      {count && <span className="text-xs text-gray-400">({count})</span>}
    </label>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <CategoryNav />
      
      <main className="max-w-7xl mx-auto py-6 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column - Filters */}
          <aside className="col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

              {/* Product Rating */}
              <FilterSection title="Product Rating" sectionKey="rating">
                <CheckboxOption label="4★ & above" count="120" />
                <CheckboxOption label="3★ & above" count="250" />
                <CheckboxOption label="2★ & above" count="380" />
                <CheckboxOption label="1★ & above" count="450" />
              </FilterSection>

              {/* Brands */}
              <FilterSection title="Brands" sectionKey="brands">
                <CheckboxOption label="fresho!" count="85" />
                <CheckboxOption label="Farmland" count="42" />
                <CheckboxOption label="Green Valley" count="38" />
                <CheckboxOption label="Nature's Best" count="25" />
                <CheckboxOption label="Organic India" count="18" />
              </FilterSection>

              {/* Price */}
              <FilterSection title="Price" sectionKey="price">
                <CheckboxOption label="Under ₹50" count="95" />
                <CheckboxOption label="₹50 - ₹100" count="145" />
                <CheckboxOption label="₹100 - ₹200" count="88" />
                <CheckboxOption label="Above ₹200" count="45" />
              </FilterSection>

              {/* Discount */}
              <FilterSection title="Discount" sectionKey="discount">
                <CheckboxOption label="50% or more" count="12" />
                <CheckboxOption label="40% or more" count="28" />
                <CheckboxOption label="30% or more" count="45" />
                <CheckboxOption label="20% or more" count="78" />
                <CheckboxOption label="10% or more" count="125" />
              </FilterSection>
            </div>
          </aside>

          {/* Right Column - Products */}
          <div className="col-span-1 md:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Fruits & Vegetables</h1>
              <p className="text-sm text-gray-600 mt-1">{products.length} products found</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CategoryPage
