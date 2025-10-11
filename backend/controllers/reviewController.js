const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create product review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    // Validation
    if (!product || !rating) {
      return res.status(400).json({ 
        message: 'Product and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      'items.product': product,
      status: 'delivered'
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        message: 'You can only review products you have purchased' 
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      });
    }

    // Create review
    const review = new Review({
      user: req.user.id,
      product,
      rating,
      comment
    });

    await review.save();

    // Update product rating
    await updateProductRating(product);

    // Populate user info for response
    await review.populate('user', 'name');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, sort = '-createdAt' } = req.query;

    let filter = { product: req.params.productId };

    // Filter by rating
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments(filter);

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(req.params.productId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    ratingStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        totalReviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name images slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Update review
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = Date.now();

    await review.save();

    // Update product rating if rating changed
    if (rating !== undefined) {
      await updateProductRating(review.product);
    }

    // Populate user info for response
    await review.populate('user', 'name');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Report review
// @route   POST /api/reviews/:id/report
// @access  Private
const reportReview = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user already reported this review
    const existingReport = review.reported.users.find(
      userId => userId.toString() === req.user.id
    );

    if (existingReport) {
      return res.status(400).json({ 
        message: 'You have already reported this review' 
      });
    }

    // Add report
    review.reported.users.push(req.user.id);
    review.reported.count = review.reported.users.length;

    await review.save();

    res.json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    console.error('Report review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured testimonials
// @route   GET /api/reviews/testimonials
// @access  Public
const getFeaturedTestimonials = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const testimonials = await Review.find({
      rating: { $gte: 4 },
      comment: { $ne: '' },
      isFeatured: true
    })
    .populate('user', 'name')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      testimonials
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  reportReview,
  getFeaturedTestimonials
};
