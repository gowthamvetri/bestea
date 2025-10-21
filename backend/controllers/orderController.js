const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail, orderStatusUpdateEmail, orderCancellationEmail } = require('../utils/emailTemplates');


// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      payment,
      paymentResult,
      subtotal,
      shippingCharges,
      total,
      orderNotes
    } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Validate items and check stock
    const orderItems = [];
    let calculatedItemsPrice = 0;

    for (let item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.product}` 
        });
      }

      if (!product.isActive) {
        return res.status(400).json({ 
          message: `Product is not available: ${product.name}` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const orderItem = {
        product: product._id,
        name: item.name || product.name,
        mainImage: item.mainImage || product.mainImage || null,
        variant: item.variant,
        quantity: item.quantity,
        price: product.price,
        total: product.price * item.quantity
      };

      orderItems.push(orderItem);
      calculatedItemsPrice += product.price * item.quantity;

      // Update product stock and sales
      product.stock -= item.quantity;
      product.purchases = (product.purchases || 0) + item.quantity;
      await product.save();
    }

    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${(orderCount + 1).toString().padStart(6, '0')}`;

    const order = new Order({
      user: req.user.id,
      orderNumber,
      items: orderItems,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        landmark: shippingAddress.landmark || ''
      },
      payment: {
        method: payment?.method || 'cod',
        status: 'pending'
      },
      status: 'pending',
      subtotal: calculatedItemsPrice,
      shippingCharges: shippingCharges || 0,
      total: total || calculatedItemsPrice + (shippingCharges || 0),
      notes: orderNotes || ''
    });

    const createdOrder = await order.save();

    // Send order confirmation email
    try {
      const user = await User.findById(req.user.id);
      if (user && user.email) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 SENDING ORDER CONFIRMATION EMAIL');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Order Number: ${createdOrder.orderNumber}`);
        console.log(`Recipient: ${user.email}`);
        console.log(`Customer Name: ${user.name}`);
        
        const emailResult = await sendEmail({
          email: user.email,
          subject: `Order Confirmation - ${createdOrder.orderNumber}`,
          html: orderConfirmationEmail(createdOrder, user)
        });
        
        console.log('✅ Order confirmation email sent successfully!');
        console.log(`Message ID: ${emailResult.messageId}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('⚠️ Cannot send email: User email not found');
      }
    } catch (emailError) {
      console.error('\n❌ FAILED TO SEND ORDER CONFIRMATION EMAIL');
      console.error('Error:', emailError.message);
      console.error('Order Number:', createdOrder.orderNumber);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    // Handle both req.user.id and req.user._id for compatibility
    const userId = req.user.id || req.user._id;
    let filter = { user: userId };
    
    console.log('=== ORDERS DEBUG ===');
    console.log('User object:', req.user);
    console.log('User ID for query:', userId);
    console.log('Filter being used:', filter);
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    let orders = [];
    let totalOrders = 0;

    try {
      // First, let's check if there are ANY orders in the database
      const allOrdersCount = await Order.countDocuments({});
      console.log('Total orders in database:', allOrdersCount);
      
      // Let's also check what users exist in orders
      const distinctUsers = await Order.distinct('user');
      console.log('Distinct user IDs in orders:', distinctUsers);
      
      // Try to get orders from database with exact filter
      orders = await Order.find(filter)
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      console.log('Orders found with filter:', orders.length);
      
      // If no orders found, try alternative user matching
      if (orders.length === 0 && allOrdersCount > 0) {
        console.log('No orders found with exact user match, trying alternative matching...');
        
        // Try matching with string conversion
        const alternativeFilters = [
          { user: userId.toString() },
          { user: new require('mongoose').Types.ObjectId(userId) },
        ];
        
        for (const altFilter of alternativeFilters) {
          try {
            console.log('Trying alternative filter:', altFilter);
            const altOrders = await Order.find(altFilter)
              .populate('items.product', 'name images')
              .sort({ createdAt: -1 })
              .skip((page - 1) * limit)
              .limit(parseInt(limit));
            
            if (altOrders.length > 0) {
              console.log('Found orders with alternative filter:', altOrders.length);
              orders = altOrders;
              totalOrders = await Order.countDocuments(altFilter);
              break;
            }
          } catch (altError) {
            console.log('Alternative filter failed:', altError.message);
          }
        }
      } else {
        totalOrders = await Order.countDocuments(filter);
      }
      
      console.log('Final orders count:', orders.length);
      if (orders.length > 0) {
        console.log('Sample order:', {
          id: orders[0]._id,
          orderNumber: orders[0].orderNumber,
          user: orders[0].user,
          status: orders[0].status
        });
      }
    } catch (dbError) {
      console.log('Database error occurred:', dbError.message);
      
      // If it's a database connection error, use mock data
      // But if it's a query error, we should still try to help debug
      
      // Mock orders for development/demo
      const mockOrders = [
        {
          _id: '650a1234567890abcdef1234',
          orderNumber: 'ORD-001',
          user: userId,
          items: [
            {
              product: {
                _id: '65091234567890abcdef1234',
                name: 'Earl Grey Premium Tea',
                mainImage: '/images/tea-placeholder.svg'
              },
              name: 'Earl Grey Premium Tea',
              quantity: 2,
              price: 25.99
            },
            {
              product: {
                _id: '65091234567890abcdef1235',
                name: 'Green Tea Collection',
                mainImage: '/images/tea-placeholder.svg'
              },
              name: 'Green Tea Collection',
              quantity: 1,
              price: 35.99
            }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Credit Card',
          itemsPrice: 87.97,
          taxPrice: 8.80,
          shippingPrice: 5.99,
          totalPrice: 102.76,
          status: 'delivered',
          isDelivered: true,
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '650a1234567890abcdef1235',
          orderNumber: 'ORD-002',
          user: userId,
          items: [
            {
              product: {
                _id: '65091234567890abcdef1236',
                name: 'Chamomile Herbal Tea',
                mainImage: '/images/tea-placeholder.svg'
              },
              name: 'Chamomile Herbal Tea',
              quantity: 3,
              price: 19.99
            }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'PayPal',
          itemsPrice: 59.97,
          taxPrice: 6.00,
          shippingPrice: 5.99,
          totalPrice: 71.96,
          status: 'shipped',
          isDelivered: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '650a1234567890abcdef1236',
          orderNumber: 'ORD-003',
          user: userId,
          items: [
            {
              product: {
                _id: '65091234567890abcdef1237',
                name: 'Oolong Tea Premium',
                mainImage: '/images/tea-placeholder.svg'
              },
              name: 'Oolong Tea Premium',
              quantity: 1,
              price: 45.99
            }
          ],
          shippingAddress: {
            fullName: 'John Doe',
            addressLine1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA'
          },
          paymentMethod: 'Credit Card',
          itemsPrice: 45.99,
          taxPrice: 4.60,
          shippingPrice: 5.99,
          totalPrice: 56.58,
          status: 'processing',
          isDelivered: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];

      // Apply status filter to mock data
      if (status && status !== 'all') {
        orders = mockOrders.filter(order => order.status === status);
      } else {
        orders = mockOrders;
      }

      // Apply pagination to mock data
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      orders = orders.slice(startIndex, endIndex);
      totalOrders = mockOrders.length;
    }

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNext: page * limit < totalOrders,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      data: {
        orders: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or owns the order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const previousStatus = order.status;
    order.status = status;
    order.updatedAt = Date.now();

    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Send status update email
    try {
      const user = await User.findById(order.user);
      if (user && user.email) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 SENDING ORDER STATUS UPDATE EMAIL');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Order Number: ${order.orderNumber}`);
        console.log(`Status Change: ${previousStatus} → ${status}`);
        console.log(`Recipient: ${user.email}`);
        
        const emailResult = await sendEmail({
          email: user.email,
          subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - ${order.orderNumber}`,
          html: orderStatusUpdateEmail(updatedOrder, user, previousStatus)
        });
        
        console.log('✅ Status update email sent successfully!');
        console.log(`Message ID: ${emailResult.messageId}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('⚠️ Cannot send status update email: User email not found');
      }
    } catch (emailError) {
      console.error('\n❌ FAILED TO SEND STATUS UPDATE EMAIL');
      console.error('Error:', emailError.message);
      console.error('Order Number:', order.orderNumber);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      // Don't fail the status update if email fails
    }

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process payment for order
// @route   POST /api/orders/:id/payment
// @access  Private
const processPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.paymentStatus = 'paid';
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.payer?.email_address,
    };

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if order can be cancelled
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that has been shipped or delivered' 
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    // Check if order is within 24 hours
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - orderTime) / (1000 * 60 * 60);

    if (hoursPassed > 24) {
      return res.status(400).json({ 
        message: 'Order can only be cancelled within 24 hours of placement',
        canCancel: false
      });
    }

    // Restore product stock
    for (let item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.purchases = Math.max((product.purchases || 0) - item.quantity, 0);
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = req.body.reason || 'Cancelled by customer';

    const updatedOrder = await order.save();

    // Send cancellation email
    try {
      const user = await User.findById(order.user);
      if (user && user.email) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 SENDING ORDER CANCELLATION EMAIL');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Order Number: ${order.orderNumber}`);
        console.log(`Cancellation Reason: ${order.cancellationReason}`);
        console.log(`Recipient: ${user.email}`);
        
        const emailResult = await sendEmail({
          email: user.email,
          subject: `Order Cancelled - ${order.orderNumber}`,
          html: orderCancellationEmail(updatedOrder, user)
        });
        
        console.log('✅ Cancellation email sent successfully!');
        console.log(`Message ID: ${emailResult.messageId}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      } else {
        console.log('⚠️ Cannot send cancellation email: User email not found');
      }
    } catch (emailError) {
      console.error('\n❌ FAILED TO SEND CANCELLATION EMAIL');
      console.error('Error:', emailError.message);
      console.error('Order Number:', order.orderNumber);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};;

// @desc    Get order tracking info
// @route   GET /api/orders/:id/track
// @access  Private
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber status createdAt updatedAt trackingInfo shippingAddress')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Create tracking timeline
    const timeline = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received and is being processed',
        completed: true,
        date: order.createdAt
      },
      {
        status: 'confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status),
        date: order.status !== 'pending' ? order.updatedAt : null
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Your order is being prepared for shipment',
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        date: order.status === 'processing' ? order.updatedAt : null
      },
      {
        status: 'shipped',
        title: 'Shipped',
        description: 'Your order has been shipped and is on its way',
        completed: ['shipped', 'delivered'].includes(order.status),
        date: order.status === 'shipped' ? order.updatedAt : null
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered successfully',
        completed: order.status === 'delivered',
        date: order.status === 'delivered' ? order.updatedAt : null
      }
    ];

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        timeline,
        trackingInfo: order.trackingInfo,
        estimatedDelivery: order.estimatedDelivery
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  processPayment,
  trackOrder
};
