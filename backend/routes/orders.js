const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  processPayment
} = require('../controllers/orderController');
const { debugOrders } = require('../controllers/debugController');
const { fetchUserOrdersUniversal } = require('../controllers/orderControllerUniversal');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, createOrder);

// @route   GET /api/orders/debug
// @desc    Debug all orders (development only)
// @access  Private
router.get('/debug', auth, debugOrders);

// @route   GET /api/orders
// @desc    Get user orders (universal version)
// @access  Private
router.get('/', auth, fetchUserOrdersUniversal);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', auth, updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private
router.delete('/:id', auth, cancelOrder);

// @route   POST /api/orders/:id/payment
// @desc    Process payment for order
// @access  Private
router.post('/:id/payment', auth, processPayment);

module.exports = router;
