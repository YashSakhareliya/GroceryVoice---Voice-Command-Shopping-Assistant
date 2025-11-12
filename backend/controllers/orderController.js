import Order from '../models/order.js';
import ShoppingList from '../models/shoppingList.js';
import Product from '../models/product.js';
import { calculateProductsDiscount } from '../utils/calculateDiscount.js';

// @desc    Create order from shopping list
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    // Get user's shopping list
    const shoppingList = await ShoppingList.findOne({ user: req.user._id })
      .populate('items.product');

    if (!shoppingList) {
      return res.status(404).json({ 
        success: false,
        message: 'Shopping list not found' 
      });
    }

    if (shoppingList.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Shopping list is empty. Add items before placing an order.' 
      });
    }

    // Validate stock availability and calculate prices with discounts
    const orderItems = [];
    let totalAmount = 0;

    for (const item of shoppingList.items) {
      const product = item.product;

      // Check if product exists
      if (!product) {
        return res.status(400).json({ 
          success: false,
          message: `Product ${item.name} no longer exists` 
        });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      // Calculate price with discount
      const productsWithDiscount = await calculateProductsDiscount([product]);
      const productWithDiscount = productsWithDiscount[0];
      const priceAtPurchase = productWithDiscount.finalPrice;

      // Add to order items
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        priceAtPurchase: priceAtPurchase,
      });

      // Calculate total
      totalAmount += priceAtPurchase * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create the order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });

    await order.save();

    // Clear the shopping list
    shoppingList.items = [];
    await shoppingList.save();

    // Populate the order before sending response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name imageUrl brand');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / Number(limit)),
        totalOrders,
        limit: Number(limit),
      },
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name imageUrl brand unit');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server Error' 
    });
  }
};
