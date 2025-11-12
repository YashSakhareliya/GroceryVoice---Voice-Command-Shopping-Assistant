import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount'], // e.g., 20% off OR 5 off
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  // Defines what the discount applies to
  appliesTo: {
    type: String,
    enum: ['product', 'category'],
    required: true,
  },
  targetProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  targetCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  
  // The application logic will query for discounts where:
  // startDate <= Date.now() AND endDate >= Date.now()
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Discount', discountSchema);