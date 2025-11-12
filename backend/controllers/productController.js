import Product from '../models/product.js';
import Category from '../models/category.js';

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
      substituteIds, // Expecting an array of product IDs for substitutes
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

    // Handle Substitutes: Validate provided IDs
    let substitutes = [];
    if (substituteIds && substituteIds.length > 0) {
      // Check if all provided substitute IDs are valid products
      const foundProducts = await Product.find({ '_id': { $in: substituteIds } });
      if (foundProducts.length !== substituteIds.length) {
        return res.status(400).json({ message: 'One or more substitute product IDs are invalid.' });
      }
      substitutes = foundProducts.map(p => p._id);
    }

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
      substitutes,
      addedBy: req.user._id, // from protect middleware
    });

    const createdProduct = await product.save();
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
      substituteIds,
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

    // Handle substitutes update
    if (substituteIds) {
        let substitutes = [];
        if (substituteIds.length > 0) {
            const foundProducts = await Product.find({ '_id': { $in: substituteIds } });
            if (foundProducts.length !== substituteIds.length) {
                return res.status(400).json({ message: 'One or more substitute product IDs are invalid.' });
            }
            substitutes = foundProducts.map(p => p._id);
        }
        product.substitutes = substitutes;
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