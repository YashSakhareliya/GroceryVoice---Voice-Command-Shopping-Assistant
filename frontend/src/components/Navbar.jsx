import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Search, ShoppingCart, User } from 'lucide-react'
import { openAuthModal, logout } from '../store/slices/authSlice'

function Navbar() {
  const [selectedLocation, setSelectedLocation] = useState('Mumbai')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)

  const handleLocationClick = () => {
    const newLocation = prompt('Enter your location:', selectedLocation)
    if (newLocation) {
      setSelectedLocation(newLocation)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <nav className="w-full bg-white py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
          <h1 className="text-dark-green font-bold text-2xl">
            GroceryVoice
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for Products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>
        </form>

        {/* Delivery Info */}
        <div className="bg-black text-white px-4 py-1 rounded-md">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-green-500">⚡</span>
            <span className="font-semibold">Delivery in 5 mins</span>
          </div>
          <button 
            onClick={handleLocationClick}
            className="text-xs text-gray-300 hover:text-white hover:underline cursor-pointer"
          >
            {selectedLocation || 'Select Location'}
          </button>
        </div>

        {/* Login/Sign Up or Profile */}
        {!isAuthenticated ? (
          <button 
            onClick={() => dispatch(openAuthModal({ isLogin: true }))}
            className="bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 whitespace-nowrap"
          >
            Login/ Sign Up
          </button>
        ) : (
          <div className="relative group">
            <button className="p-2 px-6 hover:bg-gray-100 rounded-full">
              <User size={24} className="text-gray-700" />
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block z-10 overflow-hidden">
              <button
                onClick={() => navigate('/profile')}
                className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={() => dispatch(logout())}
                className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
              >
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Cart Button */}
        <button 
          onClick={() => navigate('/cart')}
          className="relative p-2 px-6 hover:bg-gray-100 rounded-full"
        >
          <ShoppingCart size={24} className="text-gray-700" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
