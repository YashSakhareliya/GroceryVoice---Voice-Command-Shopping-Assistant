import express from 'express';
import { 
  getHistorySuggestions, 
  getDealsSuggestions, 
  getSubstituteSuggestions 
} from '../controllers/suggestionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/suggestions/history
// @desc    Get frequently purchased items from order history
// @access  Private
router.get('/history', protect, getHistorySuggestions);

// @route   GET /api/suggestions/deals
// @desc    Get seasonal items and items on sale
// @access  Public
router.get('/deals', getDealsSuggestions);

// @route   GET /api/suggestions/substitutes/:productId
// @desc    Get substitute products for a specific product
// @access  Public
router.get('/substitutes/:productId', getSubstituteSuggestions);

export default router;
