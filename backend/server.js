import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(null, true); // Allow for now, change to callback(new Error('Not allowed by CORS')) in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(cookieParser());

import authRoutes from './routes/auth.js';
import productRoutes from './routes/product.js';
import userRoutes from './routes/user.js';
import shoppingListRoutes from './routes/shoppingList.js';
import voiceRoutes from './routes/voice.js';
import orderRoutes from './routes/order.js';
import suggestionRoutes from './routes/suggestion.js';
import uploadRoutes from './routes/upload.js';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shoppinglist', shoppingListRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (req, res) => {
    res.send('Server is healthy');
});


app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});