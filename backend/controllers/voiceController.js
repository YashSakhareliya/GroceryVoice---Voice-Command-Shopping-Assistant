import Product from '../models/product.js';
import ShoppingList from '../models/shoppingList.js';
import { 
  addToShoppingList, 
  removeFromShoppingList, 
  clearShoppingList, 
  getShoppingList,
  updateProductQuantity 
} from './shoppingListController.js';

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
    /(?:add|put|include|insert)\s+(?:\d+\s+)?(.+?)(?:\s+to(?:\s+(?:my|the))?\s+(?:list|cart)|$)/i,
    /(?:remove|delete|take out|drop)\s+(?:\d+\s+)?(.+?)(?:\s+from(?:\s+(?:my|the))?\s+(?:list|cart)|$)/i,
    /(?:find|search|show|get|look for)\s+(.+?)(?:\s+in(?:\s+(?:my|the))?\s+(?:store|shop)|$)/i,
  ];

  for (const pattern of productPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      product = match[1]
        .replace(/\b(to|from|the|a|an|my|in|please|some)\b/gi, '') // Remove filler words
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      break;
    }
  }

  // If no pattern matched, try to extract product after quantity
  if (!product && quantityMatch) {
    const afterQuantity = lowerText.substring(lowerText.indexOf(quantityMatch[0]) + quantityMatch[0].length).trim();
    product = afterQuantity
      .replace(/\b(to|from|the|a|an|my|in|please|some|list|cart)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
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
    // Clean up the product name
    const cleanProductName = productName
      .replace(/\b(to|from|the|a|an|my|in)\b/gi, '') // Remove common words
      .trim();

    if (!cleanProductName) {
      return null;
    }

    // Split into individual words for better matching
    const words = cleanProductName.split(/\s+/).filter(word => word.length > 1);

    // Build query with multiple search patterns
    const searchPatterns = [
      // Exact match (highest priority)
      { name: { $regex: `^${cleanProductName}$`, $options: 'i' } },
      // Starts with
      { name: { $regex: `^${cleanProductName}`, $options: 'i' } },
      // Contains all words
      ...words.map(word => ({ name: { $regex: word, $options: 'i' } })),
    ];

    const query = {
      $or: searchPatterns
    };

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    const products = await Product.find(query).limit(10);
    
    if (products.length === 0) {
      return null;
    }

    // Score and rank products by relevance
    const scoredProducts = products.map(product => {
      let score = 0;
      const productNameLower = product.name.toLowerCase();
      const searchLower = cleanProductName.toLowerCase();

      // Exact match - highest score
      if (productNameLower === searchLower) {
        score += 100;
      }
      // Starts with search term
      else if (productNameLower.startsWith(searchLower)) {
        score += 50;
      }
      // Contains search term
      else if (productNameLower.includes(searchLower)) {
        score += 30;
      }

      // Check how many words match
      words.forEach(word => {
        if (productNameLower.includes(word.toLowerCase())) {
          score += 10;
        }
      });

      // Brand match bonus
      if (brand && product.brand && product.brand.toLowerCase().includes(brand.toLowerCase())) {
        score += 20;
      }

      return { product, score };
    });

    // Sort by score (highest first) and return best match
    scoredProducts.sort((a, b) => b.score - a.score);
    
    return scoredProducts[0].product;
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

        // Use existing addToShoppingList service
        req.body = {
          productId: product._id.toString(),
          quantity: parsed.entities.quantity,
          notes: `Added via voice: "${text}"`
        };

        // Call the existing service
        await addToShoppingList(req, {
          json: (data) => {
            return res.json({
              success: data.success,
              message: `Added ${parsed.entities.quantity} ${product.name} to your shopping list`,
              parsed,
              action: 'added',
              redirect: '/cart',
              product: {
                id: product._id,
                name: product.name,
                quantity: parsed.entities.quantity,
              },
              shoppingList: data.shoppingList,
            });
          },
          status: (code) => ({
            json: (data) => res.status(code).json(data)
          })
        });
        break;
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

        // Check if user wants to remove specific quantity or entire item
        const removeQuantity = parsed.entities.quantity;

        // Get user's shopping list to check current quantity
        const shoppingList = await ShoppingList.findOne({ user: req.user._id });
        
        if (!shoppingList) {
          return res.status(404).json({ 
            success: false,
            message: 'Shopping list not found' 
          });
        }

        const existingItem = shoppingList.items.find(
          item => item.product.toString() === product._id.toString()
        );

        if (!existingItem) {
          return res.json({
            success: false,
            message: `${product.name} is not in your shopping list`,
            parsed,
          });
        }

        // If quantity to remove is less than current quantity, update quantity
        if (removeQuantity < existingItem.quantity && removeQuantity > 0) {
          // Update quantity
          req.body = {
            productId: product._id.toString(),
            quantity: existingItem.quantity - removeQuantity
          };
          
          await updateProductQuantity(req, {
            json: (data) => {
              return res.json({
                success: true,
                message: `Removed ${removeQuantity} ${product.name} from your shopping list. ${data.shoppingList.items.find(i => i.product._id.toString() === product._id.toString()).quantity} remaining`,
                parsed,
                action: 'quantity_reduced',
                redirect: '/cart',
                product: {
                  id: product._id,
                  name: product.name,
                  quantityRemoved: removeQuantity,
                  quantityRemaining: data.shoppingList.items.find(i => i.product._id.toString() === product._id.toString()).quantity,
                },
                shoppingList: data.shoppingList,
              });
            },
            status: (code) => ({
              json: (data) => res.status(code).json(data)
            })
          });
        } else {
          // Remove entire item from list
          req.params = { productId: product._id.toString() };

          await removeFromShoppingList(req, {
            json: (data) => {
              if (!data.success) {
                return res.json({
                  success: false,
                  message: `${product.name} was not in your shopping list`,
                  parsed,
                });
              }
              return res.json({
                success: true,
                message: `Removed ${product.name} from your shopping list`,
                parsed,
                action: 'removed',
                redirect: '/cart',
                product: {
                  id: product._id,
                  name: product.name,
                },
                shoppingList: data.shoppingList,
              });
            },
            status: (code) => ({
              json: (data) => res.status(code).json(data)
            })
          });
        }
        break;
      }

      case 'clear_list': {
        // Use existing clearShoppingList service
        await clearShoppingList(req, {
          json: (data) => {
            return res.json({
              success: true,
              message: data.message,
              parsed,
              action: 'cleared',
              redirect: '/cart',
              shoppingList: data.shoppingList,
            });
          },
          status: (code) => ({
            json: (data) => res.status(code).json(data)
          })
        });
        break;
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
          redirect: '/products',
          searchQuery: parsed.entities.product,
          products,
        });
      }

      case 'view_list': {
        // Use existing getShoppingList service
        await getShoppingList(req, {
          json: (data) => {
            return res.json({
              success: true,
              message: `You have ${data.shoppingList.items.length} items in your shopping list`,
              parsed,
              action: 'view',
              redirect: '/cart',
              shoppingList: data.shoppingList,
            });
          },
          status: (code) => ({
            json: (data) => res.status(code).json(data)
          })
        });
        break;
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
