const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getFeaturedTestimonials,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  reportReview,
  getMyReviews
} = require('../controllers/reviewController');

// @route   GET /api/reviews/featured
// @desc    Get featured testimonials for homepage
// @access  Public
router.get('/featured-testimonials', getFeaturedTestimonials);

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a specific product
// @access  Public
router.get('/product/:productId', getProductReviews);

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth, createReview);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, deleteReview);

// @route   POST /api/reviews/:id/report
// @desc    Report a review
// @access  Private
router.post('/:id/report', auth, reportReview);

// @route   GET /api/reviews/user
// @desc    Get user's reviews
// @access  Private
router.get('/user', auth, getMyReviews);

module.exports = router;
