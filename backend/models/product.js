import mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    default: 'item', // e.g., "lb", "kg", "gallon"
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  // CRITICAL for voice search (e.g., "Find organic apples")
  tags: {
    type: [String],
    default: [],
  },
  imageUrl: {
    type: String,
  },
  // --- Feature Support for Smart Suggestions ---
  isSeasonal: {
    type: Boolean,
    default: false,
  },
  // For "Substitutes" feature (e.g., Almond Milk for Milk)
  substitutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  // --- Admin Tracking ---
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Product', productSchema);