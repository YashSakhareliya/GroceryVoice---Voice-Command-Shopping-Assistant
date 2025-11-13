import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import AuthModal from './components/AuthModal'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthModal />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
