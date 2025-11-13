import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import CategoryNav from '../components/CategoryNav'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/productService'

function ProductsPage() {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || ''
  
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState(categoryParam ? [categoryParam] : [])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState({ min: null, max: null })
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    rating: true,
    brands: true,
    price: true,
    discount: true
  })

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        const params = {}
        
        if (searchQuery) {
          params.search = searchQuery
        }
        
        if (selectedBrands.length > 0) {
          params.brand = selectedBrands[0] // API supports single brand
        }
        
        if (priceRange.min) params.minPrice = priceRange.min
        if (priceRange.max) params.maxPrice = priceRange.max
        
        // If specific categories selected, fetch from each
        if (selectedCategories.length > 0) {
          // For now, just search with tags
          params.tags = selectedCategories.join(',')
        }
        
        const data = await productService.getProducts(params)
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, selectedCategories, selectedBrands, priceRange])

  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : [])
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

  const brands = ['fresho!', 'Amul', 'Mother Dairy', 'Britannia', 'Tata', 'Fortune', 'Aashirvaad']

  const getPageTitle = () => {
    if (searchQuery && selectedCategories.length > 0) {
      return `Search results for "${searchQuery}" in ${selectedCategories.join(', ')}`
    } else if (searchQuery) {
      return `Search results for "${searchQuery}"`
    } else if (selectedCategories.length > 0) {
      return selectedCategories.join(', ')
    }
    return 'All Products'
  }

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category)
      } else {
        return [...prev, category]
      }
    })
  }

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand)
      } else {
        return [...prev, brand]
      }
    })
  }

  const handlePriceFilter = (min, max) => {
    setPriceRange({ min, max })
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
                  checked={selectedCategories.length === 0}
                  onChange={() => setSelectedCategories([])}
                />
                {categories.map((cat) => (
                  <CheckboxOption 
                    key={cat}
                    label={cat} 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
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
                {brands.map((brand) => (
                  <CheckboxOption 
                    key={brand}
                    label={brand}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                ))}
              </FilterSection>

              {/* Price */}
              <FilterSection title="Price" sectionKey="price">
                <CheckboxOption 
                  label="Under ₹50" 
                  checked={priceRange.max === 50}
                  onChange={() => handlePriceFilter(null, 50)}
                />
                <CheckboxOption 
                  label="₹50 - ₹100"
                  checked={priceRange.min === 50 && priceRange.max === 100}
                  onChange={() => handlePriceFilter(50, 100)}
                />
                <CheckboxOption 
                  label="₹100 - ₹200"
                  checked={priceRange.min === 100 && priceRange.max === 200}
                  onChange={() => handlePriceFilter(100, 200)}
                />
                <CheckboxOption 
                  label="Above ₹200"
                  checked={priceRange.min === 200}
                  onChange={() => handlePriceFilter(200, null)}
                />
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
              <p className="text-sm text-gray-600 mt-1">
                {loading ? 'Loading...' : `${products.length} products found`}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductsPage
