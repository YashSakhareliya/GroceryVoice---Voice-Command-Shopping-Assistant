import express from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create order from shopping list
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, getOrderById);

export default router;
