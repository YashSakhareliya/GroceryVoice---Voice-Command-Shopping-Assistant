import Product from '../models/product.js';
import Category from '../models/category.js';
import { calculateProductsDiscount } from '../utils/calculateDiscount.js';

// @desc    Get all products with discounts applied
// @route   GET /api/user/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { search, tags, brand, isSeasonal, minPrice, maxPrice, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by tags
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagsArray };
    }

    // Filter by brand
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // Filter by seasonal
    if (isSeasonal !== undefined) {
      query.isSeasonal = isSeasonal === 'true';
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get products with populated category
    const products = await Product.find(query)
      .populate('category', 'name description')
      .populate('substitutes', 'name basePrice imageUrl')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Calculate discounts for all products
    const productsWithDiscounts = await calculateProductsDiscount(products);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      products: productsWithDiscounts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / Number(limit)),
        totalProducts,
        limit: Number(limit),
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get products by category with discounts applied
// @route   GET /api/user/products/category/:categoryId
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, minPrice, maxPrice, brand, isSeasonal } = req.query;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Build query
    const query = { category: categoryId };

    // Filter by brand
    if (brand) {
      query.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
    }

    // Filter by seasonal
    if (isSeasonal !== undefined) {
      query.isSeasonal = isSeasonal === 'true';
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get products
    const products = await Product.find(query)
      .populate('category', 'name description')
      .populate('substitutes', 'name basePrice imageUrl')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Calculate discounts for all products
    const productsWithDiscounts = await calculateProductsDiscount(products);

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.json({
      success: true,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description,
      },
      products: productsWithDiscounts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / Number(limit)),
        totalProducts,
        limit: Number(limit),
      },
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single product by ID with discount applied
// @route   GET /api/user/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description')
      .populate('substitutes', 'name basePrice imageUrl brand');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate discount for this product
    const productWithDiscount = await calculateProductsDiscount([product]);

    res.json({
      success: true,
      product: productWithDiscount[0],
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
