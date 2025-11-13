import { useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState('Mumbai')

  const handleLocationClick = () => {
    const newLocation = prompt('Enter your location:', selectedLocation)
    if (newLocation) {
      setSelectedLocation(newLocation)
    }
  }

  return (
    <nav className="w-full bg-white py-3 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-dark-green font-bold text-2xl">
            GroceryVoice
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for Products..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm"
            />
          </div>
        </div>

        {/* Delivery Info */}
        <div className="flex flex-col items-start whitespace-nowrap">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="text-green-600">⚡</span>
            <span className="font-semibold">Delivery in 5 mins</span>
          </div>
          <button 
            onClick={handleLocationClick}
            className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
          >
            {selectedLocation || 'Select Location'}
          </button>
        </div>

        {/* Login/Sign Up Button */}
        <button className="bg-black text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 whitespace-nowrap">
          Login/ Sign Up
        </button>

        {/* Cart Button */}
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <ShoppingCart size={24} className="text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            0
          </span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
