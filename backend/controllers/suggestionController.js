import Order from '../models/order.js';
import Product from '../models/product.js';
import Discount from '../models/discount.js';
import { calculateProductsDiscount } from '../utils/calculateDiscount.js';

// @desc    Get frequently purchased items from order history
// @route   GET /api/suggestions/history
// @access  Private
export const getHistorySuggestions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get all user's orders
    const orders = await Order.find({ user: req.user._id });

    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        message: 'No order history found',
        suggestions: [],
      });
    }

    // Count product frequencies
    const productFrequency = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (productFrequency[productId]) {
          productFrequency[productId].count += item.quantity;
          productFrequency[productId].totalSpent += item.priceAtPurchase * item.quantity;
        } else {
          productFrequency[productId] = {
            productId,
            count: item.quantity,
            totalSpent: item.priceAtPurchase * item.quantity,
          };
        }
      });
    });

    // Sort by frequency (most purchased first)
    const sortedProducts = Object.values(productFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, Number(limit));

    // Get product details
    const productIds = sortedProducts.map(p => p.productId);
    const products = await Product.find({ _id: { $in: productIds } })
      .populate('category', 'name');

    // Calculate current discounts
    const productsWithDiscounts = await calculateProductsDiscount(products);

    // Merge frequency data with product details
    const suggestions = productsWithDiscounts.map(product => {
      const freqData = sortedProducts.find(
        p => p.productId === product._id.toString()
      );
      return {
        ...product,
        purchaseCount: freqData.count,
        totalSpent: freqData.totalSpent,
        reason: 'frequently_purchased',
      };
    });

    res.json({
      success: true,
      message: `Found ${suggestions.length} frequently purchased items`,
      suggestions,
    });

  } catch (error) {
    console.error('Error fetching history suggestions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Get seasonal items and items on sale
// @route   GET /api/suggestions/deals
// @access  Public
export const getDealsSuggestions = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const currentDate = new Date();

    // Find all active discounts
    const activeDiscounts = await Discount.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    // Get products on discount
    const discountedProductIds = new Set();
    const discountedCategoryIds = new Set();

    activeDiscounts.forEach(discount => {
      if (discount.appliesTo === 'product' && discount.targetProducts) {
        discount.targetProducts.forEach(id => discountedProductIds.add(id.toString()));
      }
      if (discount.appliesTo === 'category' && discount.targetCategories) {
        discount.targetCategories.forEach(id => discountedCategoryIds.add(id.toString()));
      }
    });

    // Build query for deals
    const dealQuery = {
      $or: [
        { isSeasonal: true },
        { _id: { $in: Array.from(discountedProductIds) } },
        { category: { $in: Array.from(discountedCategoryIds) } },
      ]
    };

    // Get products
    const products = await Product.find(dealQuery)
      .populate('category', 'name')
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.json({
        success: true,
        message: 'No deals available at the moment',
        suggestions: [],
      });
    }

    // Calculate discounts
    const productsWithDiscounts = await calculateProductsDiscount(products);

    // Add reason for each suggestion
    const suggestions = productsWithDiscounts.map(product => {
      let reason = [];
      
      if (product.isSeasonal) {
        reason.push('seasonal');
      }
      
      if (product.hasDiscount) {
        reason.push('on_sale');
      }

      return {
        ...product,
        reason: reason.join(', ') || 'deal',
      };
    });

    // Sort by discount amount (best deals first)
    suggestions.sort((a, b) => {
      const aSavings = a.appliedDiscount ? a.appliedDiscount.savedAmount : 0;
      const bSavings = b.appliedDiscount ? b.appliedDiscount.savedAmount : 0;
      return bSavings - aSavings;
    });

    res.json({
      success: true,
      message: `Found ${suggestions.length} deals`,
      suggestions,
    });

  } catch (error) {
    console.error('Error fetching deals suggestions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Get substitute products for a specific product
// @route   GET /api/suggestions/substitutes/:productId
// @access  Public
export const getSubstituteSuggestions = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product
    const product = await Product.findById(productId)
      .populate('substitutes')
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    if (!product.substitutes || product.substitutes.length === 0) {
      return res.json({
        success: true,
        message: 'No substitutes available for this product',
        product: {
          _id: product._id,
          name: product.name,
          basePrice: product.basePrice,
        },
        suggestions: [],
      });
    }

    // Calculate discounts for substitutes
    const substitutesWithDiscounts = await calculateProductsDiscount(product.substitutes);

    // Add reason and comparison to original product
    const suggestions = substitutesWithDiscounts.map(substitute => ({
      ...substitute,
      reason: 'substitute',
      comparison: {
        priceDifference: substitute.finalPrice - product.basePrice,
        percentageDifference: (((substitute.finalPrice - product.basePrice) / product.basePrice) * 100).toFixed(2),
        cheaper: substitute.finalPrice < product.basePrice,
      }
    }));

    // Sort by price (cheapest first)
    suggestions.sort((a, b) => a.finalPrice - b.finalPrice);

    res.json({
      success: true,
      message: `Found ${suggestions.length} substitute products`,
      originalProduct: {
        _id: product._id,
        name: product.name,
        basePrice: product.basePrice,
        category: product.category,
      },
      suggestions,
    });

  } catch (error) {
    console.error('Error fetching substitute suggestions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};
