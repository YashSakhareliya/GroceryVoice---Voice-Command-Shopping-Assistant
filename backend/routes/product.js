import express from 'express';
import { addProduct, updateProduct } from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import upload from '../middleware/upload.js'; 

const router = express.Router();

// @route   POST /api/products
// @desc    Add a new product
// @access  Private/Admin
router.post('/', protect, adminOnly, addProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, adminOnly, updateProduct);

export default router;
