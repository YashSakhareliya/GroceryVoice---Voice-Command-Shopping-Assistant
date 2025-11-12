import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // This is a snapshot of the items at the time of purchase
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    // CRITICAL: We save the price they *actually* paid
    priceAtPurchase: {
      type: Number,
      required: true,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
}, {
  // This will add a 'createdAt' field, which serves as the "Order Date"
  timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.model('Order', orderSchema);