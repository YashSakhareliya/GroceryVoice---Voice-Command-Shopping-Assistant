import Discount from '../models/discount.js';

/**
 * Calculate the final price of a product after applying active discounts
 * @param {Object} product - The product object
 * @returns {Object} - Product with discount information
 */
export const calculateProductDiscount = async (product) => {
  try {
    const currentDate = new Date();

    // Find all active discounts that apply to this product
    const productDiscounts = await Discount.find({
      appliesTo: 'product',
      targetProducts: product._id,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).sort({ discountValue: -1 }); // Sort by discount value descending

    // Find all active discounts that apply to this product's category
    const categoryDiscounts = await Discount.find({
      appliesTo: 'category',
      targetCategories: product.category,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    }).sort({ discountValue: -1 }); // Sort by discount value descending

    // Combine both arrays
    const allDiscounts = [...productDiscounts, ...categoryDiscounts];

    if (allDiscounts.length === 0) {
      return {
        ...product.toObject(),
        finalPrice: product.basePrice,
        hasDiscount: false,
        appliedDiscount: null,
      };
    }

    // Calculate the best discount (one that gives the lowest final price)
    let bestDiscount = null;
    let lowestPrice = product.basePrice;

    for (const discount of allDiscounts) {
      let discountedPrice;

      if (discount.discountType === 'percentage') {
        discountedPrice = product.basePrice - (product.basePrice * discount.discountValue / 100);
      } else if (discount.discountType === 'fixed_amount') {
        discountedPrice = product.basePrice - discount.discountValue;
      }

      // Ensure price doesn't go below 0
      discountedPrice = Math.max(0, discountedPrice);

      if (discountedPrice < lowestPrice) {
        lowestPrice = discountedPrice;
        bestDiscount = discount;
      }
    }

    return {
      ...product.toObject(),
      finalPrice: parseFloat(lowestPrice.toFixed(2)),
      hasDiscount: bestDiscount !== null,
      appliedDiscount: bestDiscount ? {
        name: bestDiscount.name,
        discountType: bestDiscount.discountType,
        discountValue: bestDiscount.discountValue,
        savedAmount: parseFloat((product.basePrice - lowestPrice).toFixed(2)),
      } : null,
    };

  } catch (error) {
    console.error('Error calculating discount:', error);
    return {
      ...product.toObject(),
      finalPrice: product.basePrice,
      hasDiscount: false,
      appliedDiscount: null,
    };
  }
};

/**
 * Calculate discounts for multiple products
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of products with discount information
 */
export const calculateProductsDiscount = async (products) => {
  try {
    const productsWithDiscounts = await Promise.all(
      products.map(product => calculateProductDiscount(product))
    );
    return productsWithDiscounts;
  } catch (error) {
    console.error('Error calculating discounts for products:', error);
    return products.map(product => ({
      ...product.toObject(),
      finalPrice: product.basePrice,
      hasDiscount: false,
      appliedDiscount: null,
    }));
  }
};
