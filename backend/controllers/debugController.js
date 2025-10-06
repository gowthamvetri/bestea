// Debug route to check all orders in database
const Order = require('../models/Order');

const debugOrders = async (req, res) => {
  try {
    console.log('=== DEBUG ALL ORDERS ===');
    
    // Get all orders without filtering
    const allOrders = await Order.find({})
      .populate('items.product', 'name mainImage')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('Total orders found:', allOrders.length);
    
    // Get distinct users
    const distinctUsers = await Order.distinct('user');
    console.log('Distinct users in orders:', distinctUsers);
    
    // Current user info
    console.log('Current user from auth:', req.user);
    
    // Sample orders data
    const sampleData = allOrders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      userType: typeof order.user,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt
    }));
    
    res.json({
      success: true,
      debug: true,
      data: {
        currentUser: req.user,
        totalOrders: allOrders.length,
        distinctUsers,
        sampleOrders: sampleData,
        fullOrders: allOrders
      }
    });
    
  } catch (error) {
    console.error('Debug orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error: ' + error.message
    });
  }
};

module.exports = { debugOrders };
