import ShoppingList from '../models/shoppingList.js';
import Product from '../models/product.js';
import User from '../models/user.js';

// @desc    Add product to shopping list
// @route   POST /api/shoppinglist/add
// @access  Private
export const addToShoppingList = async (req, res) => {
  try {
    const { productId, quantity = 1, notes } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get user's shopping list
    let shoppingList = await ShoppingList.findOne({ user: req.user._id });

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Check if product already exists in the shopping list
    const existingItemIndex = shoppingList.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already exists
      shoppingList.items[existingItemIndex].quantity += Number(quantity);
      if (notes) {
        shoppingList.items[existingItemIndex].notes = notes;
      }
    } else {
      // Add new item to shopping list
      shoppingList.items.push({
        product: productId,
        name: product.name,
        quantity: Number(quantity),
        unit: product.unit,
        notes: notes || '',
      });
    }

    await shoppingList.save();

    // Populate the shopping list before sending response
    shoppingList = await ShoppingList.findById(shoppingList._id)
      .populate('items.product', 'name basePrice imageUrl brand stock');

    res.json({
      success: true,
      message: 'Product added to shopping list',
      shoppingList,
    });

  } catch (error) {
    console.error('Error adding to shopping list:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove product from shopping list
// @route   DELETE /api/shoppinglist/remove/:productId
// @access  Private
export const removeFromShoppingList = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Get user's shopping list
    let shoppingList = await ShoppingList.findOne({ user: req.user._id });

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Remove the item from shopping list
    shoppingList.items = shoppingList.items.filter(
      item => item.product.toString() !== productId
    );

    await shoppingList.save();

    // Populate the shopping list before sending response
    shoppingList = await ShoppingList.findById(shoppingList._id)
      .populate('items.product', 'name basePrice imageUrl brand stock');

    res.json({
      success: true,
      message: 'Product removed from shopping list',
      shoppingList,
    });

  } catch (error) {
    console.error('Error removing from shopping list:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Clear shopping list
// @route   DELETE /api/shoppinglist/clear
// @access  Private
export const clearShoppingList = async (req, res) => {
  try {
    // Get user's shopping list
    let shoppingList = await ShoppingList.findOne({ user: req.user._id });

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Clear all items
    shoppingList.items = [];
    await shoppingList.save();

    res.json({
      success: true,
      message: 'Shopping list cleared',
      shoppingList,
    });

  } catch (error) {
    console.error('Error clearing shopping list:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's shopping list
// @route   GET /api/shoppinglist
// @access  Private
export const getShoppingList = async (req, res) => {
  try {
    const shoppingList = await ShoppingList.findOne({ user: req.user._id })
      .populate('items.product', 'name basePrice imageUrl brand stock unit');

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    res.json({
      success: true,
      shoppingList,
    });

  } catch (error) {
    console.error('Error fetching shopping list:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update product quantity in shopping list
// @route   PUT /api/shoppinglist/update
// @access  Private
export const updateProductQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Get user's shopping list
    let shoppingList = await ShoppingList.findOne({ user: req.user._id });

    if (!shoppingList) {
      return res.status(404).json({ message: 'Shopping list not found' });
    }

    // Find the item in shopping list
    const itemIndex = shoppingList.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in shopping list' });
    }

    // Update quantity
    shoppingList.items[itemIndex].quantity = Number(quantity);
    await shoppingList.save();

    // Populate the shopping list before sending response
    shoppingList = await ShoppingList.findById(shoppingList._id)
      .populate('items.product', 'name basePrice imageUrl brand stock');

    res.json({
      success: true,
      message: 'Quantity updated',
      shoppingList,
    });

  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
