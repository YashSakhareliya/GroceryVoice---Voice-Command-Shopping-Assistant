# GroceryVoice - Voice Command Shopping Assistant

A modern grocery shopping platform with voice command capabilities, built with React and Node.js.

## Features

### 🎙️ Voice Commands
- Add products to cart using voice
- Search for products with voice
- Remove items from cart
- Clear shopping list
- View cart contents
- Automatic page navigation based on voice intent

### 🛒 Shopping Features
- Browse products by category
- Search and filter products
- View product details with discounts
- Add to cart functionality
- Shopping list management
- Real-time cart updates

### 💡 Smart Suggestions
- **Substitute Products**: Get alternatives when items are out of stock
- **Frequently Bought**: Personalized suggestions based on order history
- **Best Deals**: View seasonal items and discounted products
- **Daily Staples**: Quick access to essential items

### 🔐 User Authentication
- Secure login and registration
- JWT-based authentication
- User profile management
- Order history tracking

### 📦 Product Management
- Category-based organization
- Discount system (percentage & fixed amount)
- Stock management
- Product images via Cloudinary
- Price comparison with substitutes

## Tech Stack

### Frontend
- **React** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Web Speech API** - Voice recognition

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage
- **Multer** - File uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "Voice Command Shoping Assistant"
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5000`

2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## Project Structure

```
Voice Command Shoping Assistant/
├── backend/
│   ├── config/          # Database and Cloudinary config
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication & upload middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── services/    # API service functions
    │   ├── store/       # Redux store & slices
    │   └── App.jsx      # Main app component
    └── index.html
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/user/products` - Get all products
- `GET /api/user/products/:id` - Get product by ID
- `GET /api/user/products/category/:categoryId` - Get products by category
- `GET /api/user/categories` - Get all categories

### Shopping List (Cart)
- `GET /api/shopping-list` - Get user's shopping list
- `POST /api/shopping-list` - Add item to shopping list
- `PUT /api/shopping-list/:productId` - Update item quantity
- `DELETE /api/shopping-list/:productId` - Remove item

### Voice Commands
- `POST /api/voice/command` - Process voice command

### Suggestions
- `GET /api/suggestions/history` - Get frequently purchased items
- `GET /api/suggestions/deals` - Get deals and seasonal items
- `GET /api/suggestions/substitutes/:productId` - Get substitute products

### Orders
- `POST /api/order` - Create new order
- `GET /api/order` - Get user's orders

## Voice Command Examples

- "Add 2 apples to cart"
- "Remove milk from list"
- "Find bananas"
- "Search for bread"
- "Show my cart"
- "Clear shopping list"

## Features in Detail

### Voice Assistant
- Click the floating microphone button
- Speak your command clearly
- System processes the command and navigates accordingly
- Cart-related commands redirect to cart page
- Search commands redirect to products page with search query

### Product Substitutes
- When a product is out of stock, click "View Substitutes"
- Modal shows available alternatives
- Compare prices and discounts
- Add substitutes directly to cart

### Smart Filtering
- Filter by category, price range, and discount
- Real-time product updates
- Search across all products or within categories

## Browser Support

- Chrome (recommended for voice features)
- Firefox
- Safari
- Edge

**Note**: Voice recognition requires browser support for Web Speech API. Works best in Chrome.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact the development team.

---

**GroceryVoice** - Making grocery shopping smarter with voice technology! 🎙️🛒
