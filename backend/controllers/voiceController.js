import Product from '../models/product.js';
import ShoppingList from '../models/shoppingList.js';

/**
 * Extract intent and entities from voice command text
 * @param {String} text - The voice command text
 * @returns {Object} - Parsed intent and entities
 */
const parseVoiceCommand = (text) => {
  const lowerText = text.toLowerCase().trim();
  
  let intent = 'unknown';
  let action = null;
  let product = null;
  let quantity = 1;
  let brand = null;

  // Intent: Add to shopping list
  if (lowerText.match(/\b(add|put|include|insert)\b/)) {
    intent = 'add_to_list';
    action = 'add';
  }
  // Intent: Remove from shopping list
  else if (lowerText.match(/\b(remove|delete|take out|drop)\b/)) {
    intent = 'remove_from_list';
    action = 'remove';
  }
  // Intent: Clear shopping list
  else if (lowerText.match(/\b(clear|empty|delete all|remove all)\b.*\b(list|cart)\b/)) {
    intent = 'clear_list';
    action = 'clear';
  }
  // Intent: Search/Find products
  else if (lowerText.match(/\b(find|search|show|get|look for)\b/)) {
    intent = 'search_product';
    action = 'search';
  }
  // Intent: View shopping list
  else if (lowerText.match(/\b(show|view|display|what's in)\b.*\b(list|cart)\b/)) {
    intent = 'view_list';
    action = 'view';
  }

  // Extract quantity (numbers)
  const quantityMatch = lowerText.match(/\b(\d+)\b/);
  if (quantityMatch) {
    quantity = parseInt(quantityMatch[1]);
  }

  // Extract product name (after add/remove/find keywords)
  const productPatterns = [
    /(?:add|put|include|insert)\s+(?:\d+\s+)?(.+?)(?:\s+to|\s*$)/,
    /(?:remove|delete|take out|drop)\s+(?:\d+\s+)?(.+?)(?:\s+from|\s*$)/,
    /(?:find|search|show|get|look for)\s+(.+?)(?:\s+in|\s*$)/,
  ];

  for (const pattern of productPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      product = match[1].trim();
      break;
    }
  }

  // Extract brand (if mentioned)
  const brandMatch = lowerText.match(/\b(brand|from)\s+([a-z]+)/i);
  if (brandMatch && brandMatch[2]) {
    brand = brandMatch[2];
  }

  return {
    intent,
    action,
    entities: {
      product,
      quantity,
      brand,
    },
    originalText: text,
  };
};

/**
 * Find product by name (with fuzzy matching)
 * @param {String} productName - Product name to search
 * @param {String} brand - Optional brand filter
 * @returns {Object} - Found product or null
 */
const findProductByName = async (productName, brand = null) => {
  try {
    const query = {
      name: { $regex: productName, $options: 'i' }
    };

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    const products = await Product.find(query).limit(5);
    
    if (products.length === 0) {
      return null;
    }

    // Return the best match (first one)
    return products[0];
  } catch (error) {
    console.error('Error finding product:', error);
    return null;
  }
};

// @desc    Process voice command
// @route   POST /api/voice/command
// @access  Private
export const processVoiceCommand = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false,
        message: 'Voice command text is required' 
      });
    }

    // Parse the voice command
    const parsed = parseVoiceCommand(text);

    // Handle different intents
    switch (parsed.intent) {
      case 'add_to_list': {
        if (!parsed.entities.product) {
          return res.json({
            success: false,
            message: 'Could not identify the product to add',
            parsed,
          });
        }

        // Find the product
        const product = await findProductByName(
          parsed.entities.product,
          parsed.entities.brand
        );

        if (!product) {
          return res.json({
            success: false,
            message: `Product "${parsed.entities.product}" not found`,
            parsed,
            suggestion: 'Try searching with a different name',
          });
        }

        // Add to shopping list
        let shoppingList = await ShoppingList.findOne({ user: req.user._id });

        if (!shoppingList) {
          return res.status(404).json({ 
            success: false,
            message: 'Shopping list not found' 
          });
        }

        const existingItemIndex = shoppingList.items.findIndex(
          item => item.product.toString() === product._id.toString()
        );

        if (existingItemIndex > -1) {
          shoppingList.items[existingItemIndex].quantity += parsed.entities.quantity;
        } else {
          shoppingList.items.push({
            product: product._id,
            name: product.name,
            quantity: parsed.entities.quantity,
            unit: product.unit,
            notes: `Added via voice: "${text}"`,
          });
        }

        await shoppingList.save();

        return res.json({
          success: true,
          message: `Added ${parsed.entities.quantity} ${product.name} to your shopping list`,
          parsed,
          action: 'added',
          product: {
            id: product._id,
            name: product.name,
            quantity: parsed.entities.quantity,
          },
        });
      }

      case 'remove_from_list': {
        if (!parsed.entities.product) {
          return res.json({
            success: false,
            message: 'Could not identify the product to remove',
            parsed,
          });
        }

        // Find the product
        const product = await findProductByName(parsed.entities.product);

        if (!product) {
          return res.json({
            success: false,
            message: `Product "${parsed.entities.product}" not found`,
            parsed,
          });
        }

        // Remove from shopping list
        let shoppingList = await ShoppingList.findOne({ user: req.user._id });

        if (!shoppingList) {
          return res.status(404).json({ 
            success: false,
            message: 'Shopping list not found' 
          });
        }

        const initialLength = shoppingList.items.length;
        shoppingList.items = shoppingList.items.filter(
          item => item.product.toString() !== product._id.toString()
        );

        if (shoppingList.items.length === initialLength) {
          return res.json({
            success: false,
            message: `${product.name} was not in your shopping list`,
            parsed,
          });
        }

        await shoppingList.save();

        return res.json({
          success: true,
          message: `Removed ${product.name} from your shopping list`,
          parsed,
          action: 'removed',
          product: {
            id: product._id,
            name: product.name,
          },
        });
      }

      case 'clear_list': {
        let shoppingList = await ShoppingList.findOne({ user: req.user._id });

        if (!shoppingList) {
          return res.status(404).json({ 
            success: false,
            message: 'Shopping list not found' 
          });
        }

        const itemCount = shoppingList.items.length;
        shoppingList.items = [];
        await shoppingList.save();

        return res.json({
          success: true,
          message: `Cleared ${itemCount} items from your shopping list`,
          parsed,
          action: 'cleared',
          itemsCleared: itemCount,
        });
      }

      case 'search_product': {
        if (!parsed.entities.product) {
          return res.json({
            success: false,
            message: 'Could not identify what to search for',
            parsed,
          });
        }

        const products = await Product.find({
          name: { $regex: parsed.entities.product, $options: 'i' }
        })
        .limit(10)
        .select('name brand basePrice imageUrl stock');

        return res.json({
          success: true,
          message: `Found ${products.length} products matching "${parsed.entities.product}"`,
          parsed,
          action: 'search',
          products,
        });
      }

      case 'view_list': {
        const shoppingList = await ShoppingList.findOne({ user: req.user._id })
          .populate('items.product', 'name basePrice imageUrl brand stock');

        if (!shoppingList) {
          return res.status(404).json({ 
            success: false,
            message: 'Shopping list not found' 
          });
        }

        return res.json({
          success: true,
          message: `You have ${shoppingList.items.length} items in your shopping list`,
          parsed,
          action: 'view',
          shoppingList,
        });
      }

      default: {
        return res.json({
          success: false,
          message: 'Could not understand the command. Try commands like "add 2 apples" or "remove milk"',
          parsed,
          suggestions: [
            'Add [quantity] [product name]',
            'Remove [product name]',
            'Clear shopping list',
            'Find [product name]',
            'Show my shopping list',
          ],
        });
      }
    }

  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};
