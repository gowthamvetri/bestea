const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getMe } = require('../controllers/authController');

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getMe);

module.exports = router;
