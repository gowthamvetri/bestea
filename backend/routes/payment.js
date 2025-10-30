const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayPayment,
  refundRazorpayPayment,
  getPaymentMethods
} = require('../controllers/paymentController');

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', getPaymentMethods);

// @route   POST /api/payment/create-razorpay-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-razorpay-order', auth, createRazorpayOrder);

// @route   POST /api/payment/verify-razorpay
// @desc    Verify Razorpay payment signature
// @access  Private
router.post('/verify-razorpay', auth, verifyRazorpayPayment);

// @route   GET /api/payment/razorpay/:paymentId
// @desc    Get Razorpay payment details
// @access  Private
router.get('/razorpay/:paymentId', auth, getRazorpayPayment);

// @route   POST /api/payment/razorpay/refund
// @desc    Refund Razorpay payment (Admin only)
// @access  Private
router.post('/razorpay/refund', auth, refundRazorpayPayment);

module.exports = router;
