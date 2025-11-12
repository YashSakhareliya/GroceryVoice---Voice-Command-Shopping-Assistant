import mongoose from "mongoose";

const shoppingListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // This enforces that a user can only have ONE active shopping list
    unique: true, 
  },
  // This is the array of items currently in the cart
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Denormalized name for quick display in the cart
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unit: {
      type: String,
    },
    notes: {
      type: String, // e.g., "get ripe ones" from voice command
      trim: true,
    }
  }],
}, {
  // Tells us when the cart was last modified
  timestamps: true, 
});

export default mongoose.model('ShoppingList', shoppingListSchema);
