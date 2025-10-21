const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  syncWishlist
} = require('../controllers/wishlistController');

// All routes require authentication
router.use(auth);

// Get wishlist
router.get('/', getWishlist);

// Add to wishlist
router.post('/', addToWishlist);

// Sync wishlist from localStorage
router.post('/sync', syncWishlist);

// Remove from wishlist
router.delete('/:productId', removeFromWishlist);

// Clear wishlist
router.delete('/', clearWishlist);

module.exports = router;
