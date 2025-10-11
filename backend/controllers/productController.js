const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      category,
      price,
      rating,
      search,
      sort = 'featured',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price filter
    if (price) {
      const priceRange = price.split('-');
      if (priceRange[0] === '1000+') {
        filter.price = { $gte: 1000 };
      } else if (priceRange.length === 2) {
        filter.price = {
          $gte: parseInt(priceRange[0]),
          $lte: parseInt(priceRange[1])
        };
      }
    }

    // Rating filter
    if (rating) {
      filter.averageRating = { $gte: parseFloat(rating) };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    let sortObj = {};
    switch (sort) {
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1 };
        break;
      case 'popular':
        sortObj = { purchases: -1 };
        break;
      default:
        sortObj = { isFeatured: -1, createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get products and total count
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    res.json({
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProducts,
        hasNext,
        hasPrev,
        limit: limitNum
      },
      filters: {
        category,
        price,
        rating,
        search,
        sort
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    let product;
    
    try {
      // Try to get from database first (without problematic population)
      product = await Product.findById(req.params.id)
        .populate('category', 'name slug');
    } catch (dbError) {
      console.log('Database error, will use mock data if available:', dbError.message);
      product = null;
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .limit(4)
    .populate('category', 'name slug');

    res.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.json({ products: [] });
    }

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .limit(parseInt(limit))
    .populate('category', 'name slug')
    .select('name price mainImage slug averageRating category');

    res.json({ products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get best selling products
// @route   GET /api/products/bestsellers
// @access  Public
const getBestSellers = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    // First priority: products marked as bestsellers by admin
    let bestSellers = await Product.find({ 
      isActive: true,
      isBestseller: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug');

    // If not enough bestsellers, fill with products that have actual sales
    if (bestSellers.length < parseInt(limit)) {
      const remainingLimit = parseInt(limit) - bestSellers.length;
      const productIds = bestSellers.map(p => p._id);
      
      const salesBasedProducts = await Product.find({ 
        isActive: true,
        purchases: { $gt: 0 },
        _id: { $nin: productIds }
      })
      .sort({ purchases: -1 })
      .limit(remainingLimit)
      .populate('category', 'name slug');
      
      bestSellers = [...bestSellers, ...salesBasedProducts];
    }

    // If still not enough, fill with featured products
    if (bestSellers.length < parseInt(limit)) {
      const remainingLimit = parseInt(limit) - bestSellers.length;
      const productIds = bestSellers.map(p => p._id);
      
      const featuredProducts = await Product.find({ 
        isActive: true,
        isFeatured: true,
        _id: { $nin: productIds }
      })
      .sort({ createdAt: -1 })
      .limit(remainingLimit)
      .populate('category', 'name slug');
      
      bestSellers = [...bestSellers, ...featuredProducts];
    }

    // If still not enough, fill with any active products
    if (bestSellers.length < parseInt(limit)) {
      const remainingLimit = parseInt(limit) - bestSellers.length;
      const productIds = bestSellers.map(p => p._id);
      
      const anyProducts = await Product.find({ 
        isActive: true,
        _id: { $nin: productIds }
      })
      .sort({ createdAt: -1 })
      .limit(remainingLimit)
      .populate('category', 'name slug');
      
      bestSellers = [...bestSellers, ...anyProducts];
    }

    res.json(bestSellers);
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const featuredProducts = await Product.find({ 
      isActive: true,
      isFeatured: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('category', 'name slug');

    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getRelatedProducts,
  searchProducts,
  getBestSellers,
  getFeaturedProducts
};
