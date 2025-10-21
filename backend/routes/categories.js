const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/:slug
// @desc    Get category by slug
// @access  Public
router.get('/:slug', getCategoryBySlug);

// @route   POST /api/categories
// @desc    Create category (Admin only)
// @access  Private/Admin
router.post('/', auth, uploadCategory.single('image'), createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category (Admin only)
// @access  Private/Admin
router.put('/:id', auth, uploadCategory.single('image'), updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, deleteCategory);

module.exports = router;
