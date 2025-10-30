const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @desc    Create Razorpay order
 * @route   POST /api/payment/create-razorpay-order
 * @access  Private
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Razorpay expects amount in paise (smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order options
    const options = {
      amount: amountInPaise,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
      notes: {
        userId: req.user.id,
        email: req.user.email
      }
    };

    // Create order in Razorpay
    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID // Send key_id to frontend
      },
      message: 'Razorpay order created successfully'
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Razorpay order'
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify-razorpay
 * @access  Private
 */
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details'
      });
    }

    // Generate signature to verify
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify signature
    if (generatedSignature === razorpay_signature) {
      // Payment is authentic
      // You can now update your database with payment details

      res.json({
        success: true,
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          signature: razorpay_signature
        },
        message: 'Payment verified successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
};

/**
 * @desc    Get Razorpay payment details
 * @route   GET /api/payment/razorpay/:paymentId
 * @access  Private
 */
const getRazorpayPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Fetch Razorpay payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment details'
    });
  }
};

/**
 * @desc    Refund Razorpay payment
 * @route   POST /api/payment/razorpay/refund
 * @access  Private (Admin)
 */
const refundRazorpayPayment = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Create refund options
    const refundOptions = {
      payment_id: paymentId,
      notes: {
        reason: reason || 'Customer requested refund',
        refundedBy: req.user.id
      }
    };

    // Add amount if partial refund
    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    // Process refund
    const refund = await razorpay.payments.refund(paymentId, refundOptions);

    res.json({
      success: true,
      data: refund,
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('Razorpay refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};

/**
 * @desc    Get payment methods
 * @route   GET /api/payment/methods
 * @access  Public
 */
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Credit/Debit Cards, NetBanking, UPI, Wallets',
        enabled: true,
        icon: '💳',
        supportedMethods: [
          'Credit Card',
          'Debit Card',
          'Net Banking',
          'UPI',
          'Wallets',
          'EMI'
        ]
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive your order',
        enabled: true,
        icon: '💵',
        fees: 40 // COD charges
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getRazorpayPayment,
  refundRazorpayPayment,
  getPaymentMethods
};
