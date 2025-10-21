const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { uploadCategory } = require('../config/cloudinary');

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
router.post('/categories', auth, isAdmin, uploadCategory.single('image'), createAdminCategory);

// @route   PUT /api/admin/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/categories/:id', auth, isAdmin, uploadCategory.single('image'), updateAdminCategory);

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

// Settings Management Routes
// @route   GET /api/admin/settings
// @desc    Get admin settings
// @access  Private/Admin
router.get('/settings', auth, isAdmin, (req, res) => {
  // Return default settings for now
  res.json({
    success: true,
    data: {
      general: {
        siteName: 'BESTEA',
        siteDescription: 'Premium Tea Collection',
        adminEmail: 'admin@bestea.com',
        timezone: 'Asia/Kolkata'
      },
      shipping: {
        freeShippingThreshold: 499,
        standardShippingRate: 50,
        expressShippingRate: 100
      },
      payment: {
        razorpayEnabled: true,
        codEnabled: true,
        upiEnabled: true
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30
      },
      seo: {
        metaTitle: 'BESTEA - Premium Tea Collection',
        metaDescription: 'Discover premium quality teas from Assam\'s finest gardens',
        metaKeywords: 'tea, premium tea, assam tea, online tea store'
      }
    }
  });
});

// @route   PUT /api/admin/settings
// @desc    Update admin settings
// @access  Private/Admin
router.put('/settings', auth, isAdmin, (req, res) => {
  // For now, just return success
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: req.body
  });
});

// Test Email Configuration
// @route   POST /api/admin/test-email
// @desc    Test email configuration by sending a test email
// @access  Private/Admin
router.post('/test-email', auth, isAdmin, async (req, res) => {
  try {
    const sendEmail = require('../utils/sendEmail');
    const User = require('../models/User');
    
    const user = await User.findById(req.user.id);
    
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'User email not found'
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 TESTING EMAIL CONFIGURATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const testEmailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email Test Successful!</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <div class="success">
                <p><strong>Great news!</strong> Your email configuration is working perfectly!</p>
              </div>
              <p>This is a test email from your BESTEA e-commerce application.</p>
              <p>If you're receiving this email, it means:</p>
              <ul>
                <li>✅ SMTP server connection is working</li>
                <li>✅ Email credentials are correct</li>
                <li>✅ Email templates are rendering properly</li>
                <li>✅ Your customers will receive order confirmations</li>
              </ul>
              <p><strong>Email Configuration Details:</strong></p>
              <ul>
                <li>Host: ${process.env.EMAIL_HOST}</li>
                <li>Port: ${process.env.EMAIL_PORT}</li>
                <li>From: ${process.env.EMAIL_USER}</li>
              </ul>
              <div class="footer">
                <p>BESTEA - Premium Tea Co.</p>
                <p>This is an automated test email from your e-commerce system</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await sendEmail({
      email: user.email,
      subject: '✅ BESTEA - Email Configuration Test',
      html: testEmailHTML
    });

    console.log('✅ Test email sent successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.json({
      success: true,
      message: 'Test email sent successfully! Please check your inbox.',
      data: {
        recipient: user.email,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = router;
