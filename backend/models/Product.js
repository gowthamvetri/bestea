const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  variants: [{
    name: {
      type: String,
      required: true // e.g., "250g", "500g", "1kg"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    weight: String, // "250g", "500g", "1kg"
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  // For products without variants
  price: {
    type: Number,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Product Details
  blendType: {
    type: String,
    enum: ['BOP', 'BOPSM', 'PD', 'Dust', 'OF', 'Orthodox', 'Green', 'CTC'],
    required: true
  },
  strength: {
    type: String,
    enum: ['Light', 'Medium', 'Strong', 'Extra Strong'],
    required: true
  },
  flavorProfile: [String], // ['Aromatic', 'Spicy', 'Smooth', 'Bold']
  origin: {
    type: String,
    default: 'Assam'
  },
  processingMethod: String,
  caffeineLevel: {
    type: String,
    enum: ['Caffeine Free', 'Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  // Specifications
  cupCount: Number, // Number of cups per pack
  brewingTime: String, // "3-5 minutes"
  temperature: String, // "85-95°C"
  ingredients: [String],
  
  // SEO & Marketing
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  
  // Status & Flags
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  
  // Reviews & Ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  purchases: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  launchedAt: {
    type: Date,
    default: Date.now
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ averageRating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Generate slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Ensure only one default variant
productSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    const defaultVariants = this.variants.filter(variant => variant.isDefault);
    if (defaultVariants.length > 1) {
      // Keep only the first default variant
      this.variants.forEach((variant, index) => {
        if (index > 0 && variant.isDefault) {
          variant.isDefault = false;
        }
      });
    } else if (defaultVariants.length === 0) {
      // Set first variant as default
      this.variants[0].isDefault = true;
    }
  }
  next();
});

// Ensure only one main image
productSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const mainImages = this.images.filter(img => img.isMain);
    if (mainImages.length > 1) {
      // Keep only the first main image
      this.images.forEach((img, index) => {
        if (index > 0 && img.isMain) {
          img.isMain = false;
        }
      });
    } else if (mainImages.length === 0) {
      // Set first image as main
      this.images[0].isMain = true;
    }
  }
  next();
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.variants && this.variants.length > 0) {
    const defaultVariant = this.variants.find(v => v.isDefault) || this.variants[0];
    if (defaultVariant.originalPrice && defaultVariant.price) {
      return Math.round(((defaultVariant.originalPrice - defaultVariant.price) / defaultVariant.originalPrice) * 100);
    }
  } else if (this.originalPrice && this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for main image
productSchema.virtual('mainImage').get(function() {
  if (this.images && this.images.length > 0) {
    return this.images.find(img => img.isMain) || this.images[0];
  }
  return null;
});

// Virtual for default price (for listing pages)
productSchema.virtual('defaultPrice').get(function() {
  if (this.variants && this.variants.length > 0) {
    const defaultVariant = this.variants.find(v => v.isDefault) || this.variants[0];
    return defaultVariant.price;
  }
  return this.price;
});

// Virtual for default original price
productSchema.virtual('defaultOriginalPrice').get(function() {
  if (this.variants && this.variants.length > 0) {
    const defaultVariant = this.variants.find(v => v.isDefault) || this.variants[0];
    return defaultVariant.originalPrice;
  }
  return this.originalPrice;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
