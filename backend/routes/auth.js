const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  adminLogin,
  register,
  login,
  getMe,
  verifyToken,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], adminLogin);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits')
], register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', auth, getMe);

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post('/verify-token', auth, verifyToken);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail()
], forgotPassword);

// @route   POST /api/auth/reset-password/:resetToken
// @desc    Reset password
// @access  Public
router.post('/reset-password/:resetToken', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], resetPassword);

module.exports = router;
