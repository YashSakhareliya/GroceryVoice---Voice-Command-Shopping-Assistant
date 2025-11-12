import express from 'express';
import { getProducts, getProductsByCategory, getProductById } from '../controllers/userController.js';

const router = express.Router();

// @route   GET /api/user/products
// @desc    Get all products with discounts applied
// @access  Public
router.get('/products', getProducts);

// @route   GET /api/user/products/:id
// @desc    Get single product by ID with discount applied
// @access  Public
router.get('/products/:id', getProductById);

// @route   GET /api/user/products/category/:categoryId
// @desc    Get products by category with discounts applied
// @access  Public
router.get('/products/category/:categoryId', getProductsByCategory);

export default router;
