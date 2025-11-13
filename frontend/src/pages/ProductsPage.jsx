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
  const [allProducts, setAllProducts] = useState([]) // Store all fetched products
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState('') // Store category ID
  const [priceRange, setPriceRange] = useState({ min: null, max: null })
  const [minDiscount, setMinDiscount] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    discount: true
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories()
        setCategories(data.categories || [])
        
        // If category param exists, find and set the category ID
        if (categoryParam && data.categories) {
          const category = data.categories.find(cat => cat.name === categoryParam)
          if (category) {
            setSelectedCategoryId(category._id)
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [categoryParam])

  // Fetch products from backend when search or category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        
        let data
        
        if (selectedCategoryId) {
          // Fetch by category ID - works with or without search
          if (searchQuery) {
            // Search within selected category
            const params = { search: searchQuery }
            data = await productService.getProductsByCategory(selectedCategoryId, params)
          } else {
            // Just fetch category products
            data = await productService.getProductsByCategory(selectedCategoryId)
          }
        } else if (searchQuery) {
          // Search across all categories when no category selected
          const params = { search: searchQuery }
          data = await productService.getProducts(params)
        } else {
          // Fetch all products
          data = await productService.getProducts()
        }
        
        setAllProducts(data.products || [])
        setProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setAllProducts([])
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [searchQuery, selectedCategoryId, categoryParam])

  // Apply frontend filters when price or discount changes
  useEffect(() => {
    let filtered = [...allProducts]
    
    // Filter by price range
    if (priceRange.min !== null || priceRange.max !== null) {
      filtered = filtered.filter(product => {
        const price = product.finalPrice || product.basePrice
        if (priceRange.min !== null && price < priceRange.min) return false
        if (priceRange.max !== null && price > priceRange.max) return false
        return true
      })
    }
    
    // Filter by discount percentage
    if (minDiscount !== null) {
      filtered = filtered.filter(product => {
        if (!product.appliedDiscount) return false
        const discountPercent = product.appliedDiscount.discountType === 'percentage'
          ? product.appliedDiscount.discountValue
          : ((product.basePrice - product.finalPrice) / product.basePrice) * 100
        return discountPercent >= minDiscount
      })
    }
    
    setProducts(filtered)
  }, [allProducts, priceRange, minDiscount])

  useEffect(() => {
    // When categoryParam changes from URL, find and set the category ID
    if (categoryParam && categories.length > 0) {
      const category = categories.find(cat => cat.name === categoryParam)
      if (category) {
        setSelectedCategoryId(category._id)
      }
    } else {
      setSelectedCategoryId('')
    }
  }, [categoryParam, categories])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getPageTitle = () => {
    const selectedCategory = categories.find(cat => cat._id === selectedCategoryId)
    const categoryName = selectedCategory?.name || ''
    
    if (searchQuery && categoryName) {
      return `Search results for "${searchQuery}" in ${categoryName}`
    } else if (searchQuery) {
      return `Search results for "${searchQuery}"`
    } else if (categoryName) {
      return categoryName
    }
    return 'All Products'
  }

  const handleCategorySelect = (categoryId) => {
    // Only one category can be selected at a time
    setSelectedCategoryId(categoryId === selectedCategoryId ? '' : categoryId)
  }

  const handlePriceFilter = (min, max) => {
    // Toggle off if clicking the same filter
    if (priceRange.min === min && priceRange.max === max) {
      setPriceRange({ min: null, max: null })
    } else {
      setPriceRange({ min, max })
    }
  }

  const handleDiscountFilter = (discount) => {
    setMinDiscount(discount === minDiscount ? null : discount)
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
                  checked={!selectedCategoryId}
                  onChange={() => setSelectedCategoryId('')}
                />
                {categories.map((cat) => (
                  <CheckboxOption 
                    key={cat._id}
                    label={cat.name} 
                    checked={selectedCategoryId === cat._id}
                    onChange={() => handleCategorySelect(cat._id)}
                  />
                ))}
              </FilterSection>

              {/* Price */}
              <FilterSection title="Price" sectionKey="price">
                <CheckboxOption 
                  label="Under ₹50" 
                  checked={priceRange.min === null && priceRange.max === 50}
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
                  checked={priceRange.min === 200 && priceRange.max === null}
                  onChange={() => handlePriceFilter(200, null)}
                />
              </FilterSection>

              {/* Discount */}
              <FilterSection title="Discount" sectionKey="discount">
                <CheckboxOption 
                  label="50% or more" 
                  checked={minDiscount === 50}
                  onChange={() => handleDiscountFilter(50)}
                />
                <CheckboxOption 
                  label="40% or more" 
                  checked={minDiscount === 40}
                  onChange={() => handleDiscountFilter(40)}
                />
                <CheckboxOption 
                  label="30% or more" 
                  checked={minDiscount === 30}
                  onChange={() => handleDiscountFilter(30)}
                />
                <CheckboxOption 
                  label="20% or more" 
                  checked={minDiscount === 20}
                  onChange={() => handleDiscountFilter(20)}
                />
                <CheckboxOption 
                  label="10% or more" 
                  checked={minDiscount === 10}
                  onChange={() => handleDiscountFilter(10)}
                />
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
