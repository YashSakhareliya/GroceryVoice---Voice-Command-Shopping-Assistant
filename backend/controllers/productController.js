import Product from '../models/product.js';
import Category from '../models/category.js';
import Discount from '../models/discount.js';
import { findSimilarProducts } from '../utils/findSimilarProducts.js';

// @desc    Add a new product
// @route   POST /api/products
// @access  Private/Admin
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      basePrice,
      unit,
      sku,
      stock,
      categoryName,
      tags,
      imageUrl,
      isSeasonal,
    } = req.body;

    if (!name || !basePrice || !categoryName) {
      return res.status(400).json({ message: 'Name, base price, and category are required' });
    }

    // Handle Category: Find or Create
    let category;
    const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

    if (categoryExists) {
      category = categoryExists;
    } else {
      // If category doesn't exist, create it
      category = new Category({ name: categoryName });
      await category.save();
    }

    // Find similar products automatically based on name, brand, category, and tags
    const similarProductIds = await findSimilarProducts(name, brand, category._id, tags);

    const product = new Product({
      name,
      description,
      brand,
      basePrice,
      unit,
      sku,
      stock,
      category: category._id,
      tags,
      imageUrl,
      isSeasonal,
      substitutes: similarProductIds,
      addedBy: req.user._id, // from protect middleware
    });

    const createdProduct = await product.save();

    // Bidirectional linking: Add this product as a substitute to all similar products
    if (similarProductIds.length > 0) {
      await Product.updateMany(
        { _id: { $in: similarProductIds } },
        { $addToSet: { substitutes: createdProduct._id } }
      );
    }

    res.status(201).json(createdProduct);

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      brand,
      basePrice,
      unit,
      sku,
      stock,
      categoryName,
      tags,
      imageUrl,
      isSeasonal,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.brand = brand || product.brand;
    product.basePrice = basePrice || product.basePrice;
    product.unit = unit || product.unit;
    product.sku = sku || product.sku;
    product.stock = stock ?? product.stock;
    product.tags = tags || product.tags;
    product.imageUrl = imageUrl || product.imageUrl;
    product.isSeasonal = isSeasonal ?? product.isSeasonal;

    // Handle category update
    if (categoryName) {
      let category;
      const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
      if (categoryExists) {
        category = categoryExists;
      } else {
        category = new Category({ name: categoryName });
        await category.save();
      }
      product.category = category._id;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Apply discount to product(s) or category
// @route   POST /api/products/discount
// @access  Private/Admin
export const applyDiscount = async (req, res) => {
  try {
    const {
      name,
      description,
      discountType, // 'percentage' or 'fixed_amount'
      discountValue,
      appliesTo, // 'product' or 'category'
      targetProductIds, // Array of product IDs (required if appliesTo is 'product')
      targetCategoryIds, // Array of category IDs (required if appliesTo is 'category')
      startDate,
      endDate,
    } = req.body;

    // Validation
    if (!name || !discountType || !discountValue || !appliesTo || !startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Name, discount type, discount value, applies to, start date, and end date are required' 
      });
    }

    if (!['percentage', 'fixed_amount'].includes(discountType)) {
      return res.status(400).json({ 
        message: 'Discount type must be either "percentage" or "fixed_amount"' 
      });
    }

    if (!['product', 'category'].includes(appliesTo)) {
      return res.status(400).json({ 
        message: 'Applies to must be either "product" or "category"' 
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({ 
        message: 'Percentage discount must be between 0 and 100' 
      });
    }

    // Validate fixed amount discount
    if (discountType === 'fixed_amount' && discountValue < 0) {
      return res.status(400).json({ 
        message: 'Fixed amount discount must be a positive number' 
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    let targetProducts = [];
    let targetCategories = [];

    // Handle product-based discount
    if (appliesTo === 'product') {
      if (!targetProductIds || targetProductIds.length === 0) {
        return res.status(400).json({ 
          message: 'Target product IDs are required when applying discount to products' 
        });
      }

      // Verify all product IDs exist
      const foundProducts = await Product.find({ '_id': { $in: targetProductIds } });
      if (foundProducts.length !== targetProductIds.length) {
        return res.status(400).json({ 
          message: 'One or more product IDs are invalid' 
        });
      }

      targetProducts = targetProductIds;
    }

    // Handle category-based discount
    if (appliesTo === 'category') {
      if (!targetCategoryIds || targetCategoryIds.length === 0) {
        return res.status(400).json({ 
          message: 'Target category IDs are required when applying discount to categories' 
        });
      }

      // Verify all category IDs exist
      const foundCategories = await Category.find({ '_id': { $in: targetCategoryIds } });
      if (foundCategories.length !== targetCategoryIds.length) {
        return res.status(400).json({ 
          message: 'One or more category IDs are invalid' 
        });
      }

      targetCategories = targetCategoryIds;
    }

    // Create the discount
    const discount = new Discount({
      name,
      description,
      discountType,
      discountValue,
      appliesTo,
      targetProducts,
      targetCategories,
      startDate: start,
      endDate: end,
      createdBy: req.user._id, // from protect middleware
    });

    const createdDiscount = await discount.save();

    res.status(201).json({
      success: true,
      message: 'Discount applied successfully',
      discount: createdDiscount,
    });

  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
