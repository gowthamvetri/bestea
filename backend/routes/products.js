const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getProducts,
  getProductById,
  getRelatedProducts,
  searchProducts,
  getBestSellers,
  getFeaturedProducts
} = require('../controllers/productController');

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', searchProducts);

// @route   GET /api/products/bestsellers
// @desc    Get bestselling products
// @access  Public
router.get('/bestsellers', getBestSellers);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', getFeaturedProducts);

// @route   GET /api/products
// @desc    Get all products with filtering
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', getRelatedProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', getProductById);

module.exports = router;
