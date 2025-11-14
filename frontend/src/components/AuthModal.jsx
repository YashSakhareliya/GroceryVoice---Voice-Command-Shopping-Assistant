import { useDispatch, useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { closeAuthModal, toggleAuthMode, registerUser, loginUser, clearError } from '../store/slices/authSlice'
import { useState } from 'react'

function AuthModal() {
  const dispatch = useDispatch()
  const { isModalOpen, isLogin, loading, error } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  if (!isModalOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLogin) {
      // Login
      await dispatch(loginUser({ email, password }))
    } else {
      // Register
      await dispatch(registerUser({ email, password, firstName, lastName }))
    }
    
    // Clear form on success
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  const handleClose = () => {
    dispatch(closeAuthModal())
    dispatch(clearError())
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
  }

  const handleToggleMode = () => {
    dispatch(toggleAuthMode())
    dispatch(clearError())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-500 rounded-2xl sm:rounded-3xl shadow-xl max-w-sm sm:max-w-2xl w-full overflow-hidden flex flex-col sm:flex-row relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* Left Side - Why Choose GroceryVoice */}
        <div className="w-full sm:w-1/2 bg-gray-50 p-4 sm:p-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
            Why choose GroceryVoice?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-green rounded-full flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-white text-lg sm:text-xl">✓</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Quality</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-green rounded-full flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-white text-lg sm:text-xl">⏰</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">On time</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-green rounded-full flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-white text-lg sm:text-xl">↩</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Return Policy</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-dark-green rounded-full flex items-center justify-center mb-1.5 sm:mb-2">
                <span className="text-white text-lg sm:text-xl">🚚</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-gray-700">Free Delivery</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Signup Form */}
        <div className="w-full sm:w-1/2 bg-black text-white p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
            {isLogin ? 'Login' : 'Sign up'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">Using Email & Password</p>

          {error && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-xs sm:text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-green text-sm sm:text-base"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-green text-sm sm:text-base"
                  required
                />
              </>
            )}

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-green text-sm sm:text-base"
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-green text-sm sm:text-base"
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={handleToggleMode}
              className="text-xs sm:text-sm text-gray-400 hover:text-white"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-light-green font-semibold">
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </button>
          </div>

          <p className="text-[10px] sm:text-xs text-gray-500 mt-4 sm:mt-6 text-center">
            By continuing, I accept GroceryVoice's{' '}
            <a href="#" className="text-gray-400 hover:text-white underline">
              Terms and Conditions
            </a>{' '}
            &{' '}
            <a href="#" className="text-gray-400 hover:text-white underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal

