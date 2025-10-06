const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  images: [{
    public_id: String,
    url: String,
    alt: String
  }],
  
  // Review Quality Indicators
  verified: {
    type: Boolean,
    default: false // Set to true if user actually purchased the product
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  reported: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Featured status for testimonials
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Admin Response
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNote: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isFeatured: 1 });

// Ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await this.updateProductRating();
  }
});

// Update product rating when review is updated
reviewSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.status === 'approved') {
    await doc.updateProductRating();
  }
});

// Update product rating when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await doc.updateProductRating();
  }
});

// Method to update product rating
reviewSchema.methods.updateProductRating = async function() {
  const Product = mongoose.model('Product');
  const Review = mongoose.model('Review');
  
  const stats = await Review.aggregate([
    {
      $match: {
        product: this.product,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(this.product, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

module.exports = mongoose.model('Review', reviewSchema);
