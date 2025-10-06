const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    public_id: String,
    url: String
  },
  colorTheme: {
    type: String,
    default: '#9ACB3C'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  featuredProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
