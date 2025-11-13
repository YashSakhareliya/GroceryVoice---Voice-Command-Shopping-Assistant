import { useDispatch, useSelector } from 'react-redux'
import { X } from 'lucide-react'
import { closeAuthModal, toggleAuthMode, loginSuccess } from '../store/slices/authSlice'
import { useState } from 'react'

function AuthModal() {
  const dispatch = useDispatch()
  const { isModalOpen, isLogin } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (!isModalOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple mock authentication
    if (email && password) {
      dispatch(loginSuccess({ email, name: email.split('@')[0] }))
      setEmail('')
      setPassword('')
    }
  }

  const handleClose = () => {
    dispatch(closeAuthModal())
    setEmail('')
    setPassword('')
  }

  return (
    <div className="fixed inset-0  bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-500 rounded-3xl shadow-xl max-w-2xl w-full mx-4 overflow-hidden flex relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>

        {/* Left Side - Why Choose GroceryVoice */}
        <div className="w-1/2 bg-gray-50 p-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Why choose GroceryVoice?
          </h3>

          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-dark-green rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">✓</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Quality</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-dark-green rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">⏰</span>
              </div>
              <p className="text-sm font-medium text-gray-700">On time</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-dark-green rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">↩</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Return Policy</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-dark-green rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">🚚</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Free Delivery</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Signup Form */}
        <div className="w-1/2 bg-black text-white p-8">
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Login' : 'Sign up'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">Using Email & Password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-green"
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-light-green"
              required
            />

            <button
              type="submit"
              className="w-full bg-brand-red hover:bg-red-600 text-white font-semibold py-3 rounded-md transition-colors"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => dispatch(toggleAuthMode())}
              className="text-sm text-gray-400 hover:text-white"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-light-green font-semibold">
                {isLogin ? 'Sign Up' : 'Login'}
              </span>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6 text-center">
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
