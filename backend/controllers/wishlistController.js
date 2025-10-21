const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name slug mainImage images price defaultPrice originalPrice defaultOriginalPrice averageRating totalReviews stock category tags description shortDescription'
      });

    // If no wishlist exists, create empty one
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: []
      });
    }

    // Filter out items where product no longer exists
    const validItems = wishlist.items.filter(item => item.product);

    res.json({
      success: true,
      items: validItems.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        mainImage: item.product.mainImage,
        images: item.product.images,
        image: item.product.mainImage?.url || item.product.images?.[0]?.url,
        price: item.product.defaultPrice || item.product.price,
        originalPrice: item.product.defaultOriginalPrice || item.product.originalPrice,
        averageRating: item.product.averageRating,
        totalReviews: item.product.totalReviews,
        rating: item.product.averageRating,
        reviewCount: item.product.totalReviews,
        description: item.product.description || item.product.shortDescription,
        category: item.product.category?.name || item.product.category,
        tags: item.product.tags || [],
        stock: item.product.stock,
        inStock: item.product.stock > 0,
        addedAt: item.addedAt
      }))
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: [{ product: productId }]
      });
    } else {
      // Check if product already in wishlist
      const exists = wishlist.items.some(
        item => item.product.toString() === productId
      );

      if (exists) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }

      // Add product to wishlist
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }

    // Populate and return updated wishlist
    wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name slug mainImage images price defaultPrice originalPrice defaultOriginalPrice averageRating totalReviews stock category tags description shortDescription'
      });

    const validItems = wishlist.items.filter(item => item.product);

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      items: validItems.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        mainImage: item.product.mainImage,
        images: item.product.images,
        image: item.product.mainImage?.url || item.product.images?.[0]?.url,
        price: item.product.defaultPrice || item.product.price,
        originalPrice: item.product.defaultOriginalPrice || item.product.originalPrice,
        averageRating: item.product.averageRating,
        totalReviews: item.product.totalReviews,
        rating: item.product.averageRating,
        reviewCount: item.product.totalReviews,
        description: item.product.description || item.product.shortDescription,
        category: item.product.category?.name || item.product.category,
        tags: item.product.tags || [],
        stock: item.product.stock,
        inStock: item.product.stock > 0,
        addedAt: item.addedAt
      }))
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    // Populate and return updated wishlist
    const updatedWishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name slug mainImage images price defaultPrice originalPrice defaultOriginalPrice averageRating totalReviews stock category tags description shortDescription'
      });

    const validItems = updatedWishlist.items.filter(item => item.product);

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      items: validItems.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        mainImage: item.product.mainImage,
        images: item.product.images,
        image: item.product.mainImage?.url || item.product.images?.[0]?.url,
        price: item.product.defaultPrice || item.product.price,
        originalPrice: item.product.defaultOriginalPrice || item.product.originalPrice,
        averageRating: item.product.averageRating,
        totalReviews: item.product.totalReviews,
        rating: item.product.averageRating,
        reviewCount: item.product.totalReviews,
        description: item.product.description || item.product.shortDescription,
        category: item.product.category?.name || item.product.category,
        tags: item.product.tags || [],
        stock: item.product.stock,
        inStock: item.product.stock > 0,
        addedAt: item.addedAt
      }))
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared',
      items: []
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing wishlist',
      error: error.message
    });
  }
};

// @desc    Sync wishlist from localStorage to database
// @route   POST /api/wishlist/sync
// @access  Private
exports.syncWishlist = async (req, res) => {
  try {
    console.log('Sync wishlist request:', { user: req.user.id, body: req.body });
    
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs must be an array'
      });
    }

    // Verify all products exist
    const products = await Product.find({ _id: { $in: productIds } });
    console.log(`Found ${products.length} valid products out of ${productIds.length}`);
    
    const validProductIds = products.map(p => p._id.toString());

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      console.log('Creating new wishlist');
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: validProductIds.map(id => ({ product: id }))
      });
    } else {
      console.log('Updating existing wishlist');
      // Merge with existing items (avoid duplicates)
      const existingIds = wishlist.items.map(item => item.product.toString());
      const newIds = validProductIds.filter(id => !existingIds.includes(id));
      
      if (newIds.length > 0) {
        wishlist.items.push(...newIds.map(id => ({ product: id })));
        await wishlist.save();
        console.log(`Added ${newIds.length} new items to wishlist`);
      }
    }

    // Populate and return updated wishlist
    wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        select: 'name slug mainImage images price defaultPrice originalPrice defaultOriginalPrice averageRating totalReviews stock category tags description shortDescription'
      });

    const validItems = wishlist.items.filter(item => item.product);

    res.json({
      success: true,
      message: 'Wishlist synced successfully',
      items: validItems.map(item => ({
        _id: item.product._id,
        name: item.product.name,
        slug: item.product.slug,
        mainImage: item.product.mainImage,
        images: item.product.images,
        image: item.product.mainImage?.url || item.product.images?.[0]?.url,
        price: item.product.defaultPrice || item.product.price,
        originalPrice: item.product.defaultOriginalPrice || item.product.originalPrice,
        averageRating: item.product.averageRating,
        totalReviews: item.product.totalReviews,
        rating: item.product.averageRating,
        reviewCount: item.product.totalReviews,
        description: item.product.description || item.product.shortDescription,
        category: item.product.category?.name || item.product.category,
        tags: item.product.tags || [],
        stock: item.product.stock,
        inStock: item.product.stock > 0,
        addedAt: item.addedAt
      }))
    });
  } catch (error) {
    console.error('Sync wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing wishlist',
      error: error.message
    });
  }
};
