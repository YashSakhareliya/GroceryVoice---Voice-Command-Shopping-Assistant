import Product from '../models/product.js';


export const findSimilarProducts = async (productName, brand, categoryId, tags = [], excludeId = null) => {
  try {
    const query = {
      $or: []
    };

    // Add filter to exclude the current product (useful for updates)
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // Search by similar name (using regex for partial matching)
    if (productName) {
      const nameWords = productName.split(' ').filter(word => word.length > 2);
      if (nameWords.length > 0) {
        query.$or.push({
          name: { $regex: nameWords.join('|'), $options: 'i' }
        });
      }
    }

    // Search by same brand
    if (brand) {
      query.$or.push({
        brand: { $regex: new RegExp(`^${brand}$`, 'i') }
      });
    }

    // Search by same category
    if (categoryId) {
      query.$or.push({
        category: categoryId
      });
    }

    // Search by overlapping tags
    if (tags && tags.length > 0) {
      query.$or.push({
        tags: { $in: tags }
      });
    }

    // If no criteria provided, return empty array
    if (query.$or.length === 0) {
      return [];
    }

    const similarProducts = await Product.find(query).select('_id name brand');
    
    return similarProducts.map(product => product._id);

  } catch (error) {
    console.error('Error finding similar products:', error);
    return [];
  }
};
