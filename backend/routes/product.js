import express from 'express';
import { addProduct, updateProduct, applyDiscount } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js'; 

const router = express.Router();

// @route   POST /api/products
// @desc    Add a new product
// @access  Private/Admin
router.post('/', protect, adminOnly, addProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateProduct);

// @route   POST /api/products/discount
// @desc    Apply discount to products or categories
// @access  Private/Admin
router.post('/discount', protect, adminOnly, applyDiscount);

export default router;
