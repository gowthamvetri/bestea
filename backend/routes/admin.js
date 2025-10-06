const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

// Import controllers
const {
  getDashboardData,
  getAdminOrders,
  getAdminCustomers,
  getAdminAnalytics,
  updateOrderStatus,
  getAdminProducts,
  getAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  updateProductStatus,
  deleteAdminProduct,
  getAdminCategories,
  getAdminCategoryStats,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  bulkActionCategories,
  getAdminReviews,
  getAdminReviewStats,
  updateReviewStatus,
  deleteAdminReview,
  bulkActionReviews
} = require('../controllers/adminController');

// Dashboard Routes
// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', auth, isAdmin, getDashboardData);

// Order Management Routes
// @route   GET /api/admin/orders
// @desc    Get admin orders with pagination and filtering
// @access  Private/Admin
router.get('/orders', auth, isAdmin, getAdminOrders);

// Customer Management Routes
// @route   GET /api/admin/customers
// @desc    Get admin customers with filtering and stats
// @access  Private/Admin
router.get('/customers', auth, isAdmin, getAdminCustomers);

// Analytics Routes
// @route   GET /api/admin/analytics
// @desc    Get comprehensive analytics data
// @access  Private/Admin
router.get('/analytics', auth, isAdmin, getAdminAnalytics);

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', auth, isAdmin, updateOrderStatus);

// Product Management Routes
// @route   GET /api/admin/products
// @desc    Get admin products with pagination and filtering
// @access  Private/Admin
router.get('/products', auth, isAdmin, getAdminProducts);

// @route   GET /api/admin/products/:id
// @desc    Get single product for admin
// @access  Private/Admin
router.get('/products/:id', auth, isAdmin, getAdminProductById);

// @route   POST /api/admin/products
// @desc    Create new product
// @access  Private/Admin
router.post('/products', auth, isAdmin, createAdminProduct);

// @route   PUT /api/admin/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/products/:id', auth, isAdmin, updateAdminProduct);

// @route   PUT /api/admin/products/:id/status
// @desc    Update product status
// @access  Private/Admin
router.put('/products/:id/status', auth, isAdmin, updateProductStatus);

// @route   DELETE /api/admin/products/:id
// @desc    Delete product (soft delete by default)
// @access  Private/Admin
router.delete('/products/:id', auth, isAdmin, deleteAdminProduct);

// Category Management Routes
// @route   GET /api/admin/categories
// @desc    Get admin categories with pagination and filtering
// @access  Private/Admin
router.get('/categories', auth, isAdmin, getAdminCategories);

// @route   GET /api/admin/categories/stats
// @desc    Get category statistics
// @access  Private/Admin
router.get('/categories/stats', auth, isAdmin, getAdminCategoryStats);

// @route   POST /api/admin/categories
// @desc    Create new category
// @access  Private/Admin
router.post('/categories', auth, isAdmin, createAdminCategory);

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/categories/:id', auth, isAdmin, updateAdminCategory);

// @route   DELETE /api/admin/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/categories/:id', auth, isAdmin, deleteAdminCategory);

// @route   POST /api/admin/categories/bulk-action
// @desc    Perform bulk actions on categories
// @access  Private/Admin
router.post('/categories/bulk-action', auth, isAdmin, bulkActionCategories);

// Review Management Routes
// @route   GET /api/admin/reviews
// @desc    Get admin reviews with pagination and filtering
// @access  Private/Admin
router.get('/reviews', auth, isAdmin, getAdminReviews);

// @route   GET /api/admin/reviews/stats
// @desc    Get review statistics
// @access  Private/Admin
router.get('/reviews/stats', auth, isAdmin, getAdminReviewStats);

// @route   PUT /api/admin/reviews/:id/status
// @desc    Update review status (feature/unfeature)
// @access  Private/Admin
router.put('/reviews/:id/status', auth, isAdmin, updateReviewStatus);

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete review
// @access  Private/Admin
router.delete('/reviews/:id', auth, isAdmin, deleteAdminReview);

// @route   POST /api/admin/reviews/bulk-action
// @desc    Perform bulk actions on reviews
// @access  Private/Admin
router.post('/reviews/bulk-action', auth, isAdmin, bulkActionReviews);

module.exports = router;
