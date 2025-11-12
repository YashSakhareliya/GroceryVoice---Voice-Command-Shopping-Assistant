import Product from '../models/product.js';
import Category from '../models/category.js';
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


// @desc    Get substitute IDs for a product based on its name

// apply discount