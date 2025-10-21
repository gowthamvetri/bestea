const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One wishlist per user
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'items.product': 1 });

// Remove duplicate products
wishlistSchema.pre('save', function(next) {
  if (this.items) {
    const uniqueProducts = new Map();
    this.items.forEach(item => {
      const productId = item.product.toString();
      if (!uniqueProducts.has(productId)) {
        uniqueProducts.set(productId, item);
      }
    });
    this.items = Array.from(uniqueProducts.values());
  }
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
