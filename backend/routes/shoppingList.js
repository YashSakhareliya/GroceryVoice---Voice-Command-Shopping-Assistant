import express from 'express';
import { 
  addToShoppingList, 
  removeFromShoppingList, 
  clearShoppingList, 
  getShoppingList,
  updateProductQuantity 
} from '../controllers/shoppingListController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/shoppinglist
// @desc    Get user's shopping list
// @access  Private
router.get('/', protect, getShoppingList);

// @route   POST /api/shoppinglist/add
// @desc    Add product to shopping list
// @access  Private
router.post('/add', protect, addToShoppingList);

// @route   PUT /api/shoppinglist/update
// @desc    Update product quantity in shopping list
// @access  Private
router.put('/update', protect, updateProductQuantity);

// @route   DELETE /api/shoppinglist/remove/:productId
// @desc    Remove product from shopping list
// @access  Private
router.delete('/remove/:productId', protect, removeFromShoppingList);

// @route   DELETE /api/shoppinglist/clear
// @desc    Clear shopping list
// @access  Private
router.delete('/clear', protect, clearShoppingList);

export default router;
