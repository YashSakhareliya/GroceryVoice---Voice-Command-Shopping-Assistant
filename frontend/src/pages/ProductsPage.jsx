import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || ''
  
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    rating: true,
    brands: true,
    price: true,
    discount: true
  })

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const categories = [
    'Fruits & Vegetables',
    'Dairy & Bakery',
    'Staples',
    'Snacks',
    'Meat & Fish',
    'Beverages',
    'Personal Care',
    'Home Care',
    'Baby Care',
    'Pet Care',
    'Organic',
    'Gourmet'
  ]

  const allProducts = [
    { id: 1, category: 'Fruits & Vegetables', discount: 20, brand: 'fresho!', title: 'Organic Apples - Red', price: '50.00', oldPrice: '70.00' },
    { id: 2, category: 'Fruits & Vegetables', discount: 15, brand: 'fresho!', title: 'Fresh Bananas - Robusta', price: '40.00', oldPrice: '55.00' },
    { id: 3, category: 'Fruits & Vegetables', discount: 25, brand: 'fresho!', title: 'Tomatoes - Local', price: '25.00', oldPrice: '35.00' },
    { id: 4, category: 'Fruits & Vegetables', discount: 10, brand: 'fresho!', title: 'Onions - Bangalore Rose', price: '30.00', oldPrice: '35.00' },
    { id: 5, category: 'Fruits & Vegetables', brand: 'fresho!', title: 'Potatoes', price: '28.00' },
    { id: 6, category: 'Dairy & Bakery', discount: 18, brand: 'Amul', title: 'Butter - Salted', price: '45.00', oldPrice: '55.00' },
    { id: 7, category: 'Dairy & Bakery', brand: 'Mother Dairy', title: 'Milk - Toned', price: '28.00' },
    { id: 8, category: 'Dairy & Bakery', discount: 12, brand: 'Britannia', title: 'Bread - Whole Wheat', price: '22.00', oldPrice: '25.00' },
    { id: 9, category: 'Staples', brand: 'Tata', title: 'Salt - Iodised', price: '22.00' },
    { id: 10, category: 'Staples', brand: 'Fortune', title: 'Rice - Basmati', price: '180.00' },
    { id: 11, category: 'Snacks', discount: 30, brand: 'Lay\'s', title: 'Chips - Classic Salted', price: '20.00', oldPrice: '30.00' },
    { id: 12, category: 'Snacks', brand: 'Haldiram', title: 'Bhujia', price: '40.00' },
  ]

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = searchQuery ? 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  const getPageTitle = () => {
    if (searchQuery && selectedCategory) {
      return `Search results for "${searchQuery}" in ${selectedCategory}`
    } else if (searchQuery) {
      return `Search results for "${searchQuery}"`
    } else if (selectedCategory) {
      return selectedCategory
    }
    return 'All Products'
  }

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

  const CheckboxOption = ({ label, count, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
      <input 
        type="checkbox" 
        className="w-4 h-4 accent-dark-green" 
        checked={checked}
        onChange={onChange}
      />
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

              {/* Category Filter */}
              <FilterSection title="Category" sectionKey="category">
                <CheckboxOption 
                  label="All Categories" 
                  checked={!selectedCategory}
                  onChange={() => setSelectedCategory('')}
                />
                {categories.map((cat) => (
                  <CheckboxOption 
                    key={cat}
                    label={cat} 
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
                  />
                ))}
              </FilterSection>

              {/* Product Rating */}
              <FilterSection title="Product Rating" sectionKey="rating">
                <CheckboxOption label="4★ & above" />
                <CheckboxOption label="3★ & above" />
                <CheckboxOption label="2★ & above" />
                <CheckboxOption label="1★ & above" />
              </FilterSection>

              {/* Brands */}
              <FilterSection title="Brands" sectionKey="brands">
                <CheckboxOption label="fresho!" />
                <CheckboxOption label="Amul" />
                <CheckboxOption label="Mother Dairy" />
                <CheckboxOption label="Britannia" />
                <CheckboxOption label="Tata" />
              </FilterSection>

              {/* Price */}
              <FilterSection title="Price" sectionKey="price">
                <CheckboxOption label="Under ₹50" />
                <CheckboxOption label="₹50 - ₹100" />
                <CheckboxOption label="₹100 - ₹200" />
                <CheckboxOption label="Above ₹200" />
              </FilterSection>

              {/* Discount */}
              <FilterSection title="Discount" sectionKey="discount">
                <CheckboxOption label="50% or more" />
                <CheckboxOption label="40% or more" />
                <CheckboxOption label="30% or more" />
                <CheckboxOption label="20% or more" />
                <CheckboxOption label="10% or more" />
              </FilterSection>
            </div>
          </aside>

          {/* Right Column - Products */}
          <div className="col-span-1 md:col-span-3">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-600 mt-1">{filteredProducts.length} products found</p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductsPage
