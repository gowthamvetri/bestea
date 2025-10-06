const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Mock payment data
const mockPayments = [
  {
    _id: '64a1b2c3d4e5f6789012345a',
    orderId: '64a1b2c3d4e5f6789012345b',
    userId: '64a1b2c3d4e5f6789012345c',
    amount: 999,
    currency: 'INR',
    method: 'razorpay',
    status: 'completed',
    transactionId: 'pay_abc123xyz789',
    gatewayResponse: {
      razorpay_payment_id: 'pay_abc123xyz789',
      razorpay_order_id: 'order_def456uvw012',
      razorpay_signature: 'signature123'
    },
    createdAt: new Date('2024-09-01'),
    completedAt: new Date('2024-09-01')
  }
];

// Mock supported payment methods
const paymentMethods = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Credit/Debit Cards, NetBanking, UPI, Wallets',
    icon: '/api/placeholder/50/30',
    enabled: true,
    fees: {
      percentage: 2.5,
      fixed: 0
    }
  },
  {
    id: 'upi',
    name: 'UPI',
    description: 'Pay using any UPI app',
    icon: '/api/placeholder/50/30',
    enabled: true,
    fees: {
      percentage: 0,
      fixed: 0
    }
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: '/api/placeholder/50/30',
    enabled: true,
    fees: {
      percentage: 0,
      fixed: 50
    }
  },
  {
    id: 'wallet',
    name: 'Wallet',
    description: 'Paytm, PhonePe, Amazon Pay',
    icon: '/api/placeholder/50/30',
    enabled: true,
    fees: {
      percentage: 1.5,
      fixed: 0
    }
  }
];

// @route   GET /api/payment/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', async (req, res) => {
  try {
    const enabledMethods = paymentMethods.filter(method => method.enabled);
    
    res.json({
      success: true,
      data: enabledMethods
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
});

// @route   POST /api/payment/create-order
// @desc    Create payment order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', method } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    if (!method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }
    
    const selectedMethod = paymentMethods.find(m => m.id === method);
    if (!selectedMethod || !selectedMethod.enabled) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or disabled payment method'
      });
    }
    
    // Calculate fees
    const fees = calculateFees(amount, selectedMethod.fees);
    const totalAmount = amount + fees;
    
    // Create payment order based on method
    let paymentOrder;
    
    switch (method) {
      case 'razorpay':
        paymentOrder = createRazorpayOrder(totalAmount, currency);
        break;
      case 'upi':
        paymentOrder = createUPIOrder(totalAmount, currency);
        break;
      case 'cod':
        paymentOrder = createCODOrder(totalAmount, currency);
        break;
      case 'wallet':
        paymentOrder = createWalletOrder(totalAmount, currency);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }
    
    res.json({
      success: true,
      data: {
        orderId: paymentOrder.id,
        amount: totalAmount,
        currency,
        method,
        fees,
        ...paymentOrder
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify payment
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { orderId, transactionId, signature, method } = req.body;
    
    if (!orderId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and transaction ID are required'
      });
    }
    
    // Mock verification logic
    let verification;
    
    switch (method) {
      case 'razorpay':
        verification = verifyRazorpayPayment(orderId, transactionId, signature);
        break;
      case 'upi':
        verification = verifyUPIPayment(orderId, transactionId);
        break;
      case 'cod':
        verification = { success: true, status: 'pending' }; // COD is always pending
        break;
      case 'wallet':
        verification = verifyWalletPayment(orderId, transactionId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Unsupported payment method'
        });
    }
    
    if (verification.success) {
      // Save payment record
      const payment = {
        _id: new Date().getTime().toString(),
        orderId,
        userId: req.user.id,
        amount: req.body.amount || 0,
        currency: 'INR',
        method,
        status: verification.status || 'completed',
        transactionId,
        gatewayResponse: req.body,
        createdAt: new Date(),
        completedAt: verification.status === 'completed' ? new Date() : null
      };
      
      mockPayments.push(payment);
      
      res.json({
        success: true,
        data: payment,
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: verification.message || 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// @route   GET /api/payment/history
// @desc    Get payment history for user
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const userPayments = mockPayments.filter(payment => payment.userId === req.user.id);
    
    // Sort by newest first
    userPayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: userPayments,
      count: userPayments.length
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
});

// @route   GET /api/payment/:id
// @desc    Get payment details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = mockPayments.find(
      p => p._id === req.params.id && p.userId === req.user.id
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
});

// @route   POST /api/payment/refund
// @desc    Process refund
// @access  Private
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    if (!paymentId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID, amount, and reason are required'
      });
    }
    
    const payment = mockPayments.find(
      p => p._id === paymentId && p.userId === req.user.id
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }
    
    if (amount > payment.amount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed payment amount'
      });
    }
    
    // Mock refund processing
    const refund = {
      _id: new Date().getTime().toString(),
      paymentId,
      orderId: payment.orderId,
      userId: req.user.id,
      amount,
      reason,
      status: 'processing',
      transactionId: `refund_${Date.now()}`,
      createdAt: new Date(),
      expectedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    res.json({
      success: true,
      data: refund,
      message: 'Refund initiated successfully. You will receive the amount in 5-7 business days.'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

// Helper functions for different payment methods
function calculateFees(amount, feeStructure) {
  const percentageFee = (amount * feeStructure.percentage) / 100;
  return Math.round(percentageFee + feeStructure.fixed);
}

function createRazorpayOrder(amount, currency) {
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
    name: 'BESTEA',
    description: 'Premium Tea Purchase',
    logo: '/logo.png',
    theme: {
      color: '#F97316'
    }
  };
}

function createUPIOrder(amount, currency) {
  return {
    id: `upi_${Date.now()}`,
    amount,
    currency,
    upiId: 'bestea@upi',
    qrCode: `/api/payment/upi-qr/${Date.now()}`
  };
}

function createCODOrder(amount, currency) {
  return {
    id: `cod_${Date.now()}`,
    amount,
    currency,
    instructions: 'Please keep exact change ready. Our delivery partner will collect the payment.'
  };
}

function createWalletOrder(amount, currency) {
  return {
    id: `wallet_${Date.now()}`,
    amount,
    currency,
    supportedWallets: ['paytm', 'phonepe', 'amazonpay', 'mobikwik']
  };
}

function verifyRazorpayPayment(orderId, paymentId, signature) {
  // Mock verification - in real app, verify using Razorpay's signature verification
  return {
    success: true,
    status: 'completed'
  };
}

function verifyUPIPayment(orderId, transactionId) {
  // Mock verification - in real app, verify with UPI gateway
  return {
    success: true,
    status: 'completed'
  };
}

function verifyWalletPayment(orderId, transactionId) {
  // Mock verification - in real app, verify with wallet provider
  return {
    success: true,
    status: 'completed'
  };
}

module.exports = router;
