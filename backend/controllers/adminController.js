const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Review = require('../models/Review');

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardData = async (req, res) => {
  try {
    // Get real-time statistics from database
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      Product.aggregate([
        { $match: { isActive: true } },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    const dashboardData = {
      overview: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: revenue,
        pendingOrders: await Order.countDocuments({ status: 'pending' }),
        completedOrders: await Order.countDocuments({ status: 'delivered' }),
        cancelledOrders: await Order.countDocuments({ status: 'cancelled' })
      },
      recentOrders: recentOrders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.user?.name || 'Unknown',
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      })),
      topProducts: topProducts.map(product => ({
        _id: product._id,
        name: product.name,
        sales: product.totalSales || 0,
        revenue: (product.totalSales || 0) * (product.price || 0),
        category: product.category?.name || 'Uncategorized'
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// @desc    Get all orders with filters
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      startDate, 
      endDate,
      search 
    } = req.query;

    // Build filter query
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Build search query
    let searchFilter = null;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      
      // Find users matching search criteria first
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = matchingUsers.map(user => user._id);
      
      searchFilter = {
        $or: [
          { orderNumber: searchRegex },
          { user: { $in: userIds } }
        ]
      };
    }

    // Combine filters
    const finalFilter = searchFilter ? { ...filter, ...searchFilter } : filter;

    const [orders, totalOrders] = await Promise.all([
      Order.find(finalFilter)
        .populate('user', 'name email phone')
        .populate('items.product', 'name mainImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Order.countDocuments(finalFilter)
    ]);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.user?.name || 'Unknown',
        email: order.user?.email || 'N/A',
        phone: order.user?.phone || 'N/A'
      },
      items: order.items.map(item => ({
        product: {
          name: item.product?.name || 'Product not found',
          image: item.product?.mainImage || ''
        },
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.json({
      success: true,
      data: {
        orders: formattedOrders,
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
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAdminCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    // Build search query
    let query = { role: { $ne: 'admin' } }; // Exclude admin users
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get customers with aggregation to include order stats
    const customersAggregation = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $addFields: {
          totalOrders: { $size: '$orders' },
          totalSpent: {
            $sum: '$orders.totalAmount'
          },
          lastOrderDate: {
            $max: '$orders.createdAt'
          },
          status: { $ifNull: ['$status', 'active'] }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
          status: 1,
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    // Get total count for pagination
    const totalCustomers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers: customersAggregation,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCustomers / parseInt(limit)),
          totalCustomers,
          hasNext: page * parseInt(limit) < totalCustomers,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers'
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let currentPeriodStart, previousPeriodStart, previousPeriodEnd;

    switch (period) {
      case '7d':
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case '30d':
        currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      case '90d':
        currentPeriodStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
        break;
      default:
        currentPeriodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = currentPeriodStart;
    }

    // Get current period analytics
    const currentAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentPeriodStart, $lte: now },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get previous period analytics
    const previousAnalytics = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Get customer count
    const currentCustomers = await User.countDocuments({
      createdAt: { $gte: currentPeriodStart, $lte: now },
      role: { $ne: 'admin' }
    });

    const previousCustomers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
      role: { $ne: 'admin' }
    });

    // Get top categories
    const topCategories = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentPeriodStart, $lte: now },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          sales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 4 }
    ]);

    // Calculate total sales for percentage
    const totalSales = topCategories.reduce((sum, cat) => sum + cat.sales, 0);

    // Get recent activity
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    })
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(3);

    const recentCustomers = await User.find({
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      role: { $ne: 'admin' }
    })
    .sort({ createdAt: -1 })
    .limit(2);

    // Calculate growth percentages
    const current = currentAnalytics[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const previous = previousAnalytics[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const analytics = {
      revenue: {
        current: Math.round(current.totalRevenue || 0),
        previous: Math.round(previous.totalRevenue || 0),
        growth: Math.round(calculateGrowth(current.totalRevenue, previous.totalRevenue) * 100) / 100
      },
      orders: {
        current: current.totalOrders || 0,
        previous: previous.totalOrders || 0,
        growth: Math.round(calculateGrowth(current.totalOrders, previous.totalOrders) * 100) / 100
      },
      customers: {
        current: currentCustomers,
        previous: previousCustomers,
        growth: Math.round(calculateGrowth(currentCustomers, previousCustomers) * 100) / 100
      },
      averageOrderValue: {
        current: Math.round(current.avgOrderValue || 0),
        previous: Math.round(previous.avgOrderValue || 0),
        growth: Math.round(calculateGrowth(current.avgOrderValue, previous.avgOrderValue) * 100) / 100
      },
      topCategories: topCategories.map(cat => ({
        name: cat._id,
        sales: Math.round(cat.sales),
        percentage: totalSales > 0 ? Math.round((cat.sales / totalSales) * 1000) / 10 : 0
      })),
      recentActivity: [
        ...recentOrders.map(order => ({
          type: 'order',
          message: `New order #${order.orderNumber || order._id.toString().slice(-6)} received`,
          time: getTimeAgo(order.createdAt)
        })),
        ...recentCustomers.map(customer => ({
          type: 'customer',
          message: `New customer registration: ${customer.email}`,
          time: getTimeAgo(customer.createdAt)
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      status,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    let filter = {};

    // Status filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    } else if (status) {
      filter.isActive = status === 'active';
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    const sortField = sortBy;
    const sortObj = {};
    sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Get products with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Format products for admin display
    const formattedProducts = products.map(product => ({
      _id: product._id,
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      isActive: product.isActive,
      status: product.isActive ? 'active' : 'inactive',
      sales: product.totalSales || 0,
      averageRating: product.averageRating || 0,
      totalReviews: product.totalReviews || 0,
      category: product.category?.name || 'Uncategorized',
      categorySlug: product.category?.slug || 'uncategorized',
      isFeatured: product.isFeatured || false,
      isBestseller: product.isBestseller || false,
      isNewArrival: product.isNewArrival || false,
      images: product.images,
      mainImage: product.mainImage,
      tags: product.tags || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: product.variants || []
    }));

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts,
          limit: parseInt(limit),
          hasNext: skip + formattedProducts.length < totalProducts,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// @desc    Get single product for admin
// @route   GET /api/admin/products/:id
// @access  Private/Admin
const getAdminProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get admin product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
const updateProductStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product,
      message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteAdminProduct = async (req, res) => {
  try {
    const { permanent = false } = req.query;
    const productId = req.params.id;

    if (permanent === 'true') {
      // Permanent deletion
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product permanently deleted'
      });
    } else {
      // Soft delete - set isActive to false
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          isActive: false,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Product deactivated successfully'
      });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};

// @desc    Get all categories for admin
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAdminCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = '-createdAt', active } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (active !== 'all' && active !== undefined) {
      query.isActive = active === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get categories with product count
    const categories = await Category.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      { $project: { products: 0 } },
      { $sort: sort.startsWith('-') ? { [sort.substring(1)]: -1 } : { [sort]: 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const totalCategories = await Category.countDocuments(query);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCategories / limit),
          totalCategories,
          hasNext: page * limit < totalCategories,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// @desc    Get category statistics for admin
// @route   GET /api/admin/categories/stats
// @access  Private/Admin
const getAdminCategoryStats = async (req, res) => {
  try {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoriesWithProducts
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: false }),
      Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products'
          }
        },
        {
          $match: { 'products.0': { $exists: true } }
        },
        { $count: 'count' }
      ]).then(result => result[0]?.count || 0)
    ]);

    res.json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        categoriesWithProducts
      }
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics'
    });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/admin/categories
// @access  Private/Admin
const createAdminCategory = async (req, res) => {
  try {
    const { name, description, slug, isActive = true } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug: slug || name.toLowerCase().replace(/\s+/g, '-') }]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    const category = new Category({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      isActive
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateAdminCategory = async (req, res) => {
  try {
    const { name, description, slug, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name/slug already exists (excluding current category)
    if (name || slug) {
      const existingCategory = await Category.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(name ? [{ name }] : []),
          ...(slug ? [{ slug }] : [])
        ]
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name or slug already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (slug !== undefined) category.slug = slug;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteAdminCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} products associated with it. Please move or delete the products first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// @desc    Bulk actions for categories (Admin)
// @route   POST /api/admin/categories/bulk-action
// @access  Private/Admin
const bulkActionCategories = async (req, res) => {
  try {
    const { action, categoryIds } = req.body;

    if (!action || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Action and category IDs are required'
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateQuery = { isActive: true };
        message = 'Categories activated successfully';
        break;
      case 'deactivate':
        updateQuery = { isActive: false };
        message = 'Categories deactivated successfully';
        break;
      case 'delete':
        // Check if any categories have products
        const categoriesWithProducts = await Product.aggregate([
          { $match: { category: { $in: categoryIds.map(id => mongoose.Types.ObjectId(id)) } } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        if (categoriesWithProducts.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Cannot delete categories that have products associated with them'
          });
        }

        await Category.deleteMany({ _id: { $in: categoryIds } });
        
        return res.json({
          success: true,
          message: 'Categories deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    if (action !== 'delete') {
      await Category.updateMany(
        { _id: { $in: categoryIds } },
        updateQuery
      );
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Bulk action categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action'
    });
  }
};

// @desc    Get all reviews for admin
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAdminReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      recent = false,
      rating,
      status = 'all',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    // Build filter query
    let filter = {};

    // Rating filter
    if (rating) {
      filter.rating = parseInt(rating);
    }

    // Status filter for reported reviews
    if (status === 'reported') {
      filter['reports.0'] = { $exists: true };
    } else if (status === 'approved') {
      filter.isFeatured = true;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    // If recent flag is set, get recent reviews
    if (recent === 'true') {
      const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      filter.createdAt = { $gte: recentDate };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reviews = await Review.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name slug mainImage')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments(filter);

    // Add review statistics
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    reviewStats.forEach(stat => {
      ratingDistribution[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasNext: page * limit < totalReviews,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
};

// @desc    Get review statistics for admin
// @route   GET /api/admin/reviews/stats
// @access  Private/Admin
const getAdminReviewStats = async (req, res) => {
  try {
    const [
      totalReviews,
      averageRating,
      recentReviews,
      reportedReviews,
      featuredReviews
    ] = await Promise.all([
      Review.countDocuments(),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).then(result => result[0]?.avgRating || 0),
      Review.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Review.countDocuments({ 'reports.0': { $exists: true } }),
      Review.countDocuments({ isFeatured: true })
    ]);

    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        recentReviews,
        reportedReviews,
        featuredReviews
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review statistics'
    });
  }
};

// @desc    Update review status (feature/unfeatured)
// @route   PUT /api/admin/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = async (req, res) => {
  try {
    const { isFeatured } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isFeatured = isFeatured;
    await review.save();

    res.json({
      success: true,
      message: `Review ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: review
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status'
    });
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteAdminReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating after deletion
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete admin review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
};

// @desc    Bulk actions for reviews (Admin)
// @route   POST /api/admin/reviews/bulk-action
// @access  Private/Admin
const bulkActionReviews = async (req, res) => {
  try {
    const { action, reviewIds } = req.body;

    if (!action || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Action and review IDs are required'
      });
    }

    let updateQuery = {};
    let message = '';

    switch (action) {
      case 'feature':
        updateQuery = { isFeatured: true };
        message = 'Reviews featured successfully';
        break;
      case 'unfeature':
        updateQuery = { isFeatured: false };
        message = 'Reviews unfeatured successfully';
        break;
      case 'delete':
        // Get product IDs before deletion for rating update
        const reviews = await Review.find({ _id: { $in: reviewIds } }, 'product');
        const productIds = [...new Set(reviews.map(r => r.product))];
        
        await Review.deleteMany({ _id: { $in: reviewIds } });
        
        // Update ratings for affected products
        for (const productId of productIds) {
          await updateProductRating(productId);
        }
        
        return res.json({
          success: true,
          message: 'Reviews deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    if (action !== 'delete') {
      await Review.updateMany(
        { _id: { $in: reviewIds } },
        updateQuery
      );
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Bulk action reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk action'
    });
  }
};

// Helper function to update product rating (shared with reviewController)
const updateProductRating = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// @desc    Create product (Admin)
// @route   POST /api/admin/products
// @access  Private/Admin
const createAdminProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      price,
      originalPrice,
      stock,
      sku,
      weight,
      ingredients,
      brewingInstructions,
      origin,
      grade,
      harvestSeason,
      caffeine,
      flavorProfile,
      healthBenefits,
      storageInstructions,
      certifications,
      isActive,
      isFeatured,
      isBestseller,
      isNewArrival,
      images,
      mainImage,
      tags,
      variants,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Product description is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid product price is required'
      });
    }

    if (!stock || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected'
      });
    }

    // Check if SKU already exists
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Create the product
    const product = new Product({
      name,
      description,
      shortDescription,
      category,
      subCategory,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      stock: parseInt(stock),
      sku,
      weight,
      ingredients,
      brewingInstructions,
      origin,
      grade,
      harvestSeason,
      caffeine,
      flavorProfile,
      healthBenefits,
      storageInstructions,
      certifications,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      isBestseller: isBestseller || false,
      isNewArrival: isNewArrival || false,
      images: images || [],
      mainImage,
      tags: tags || [],
      variants: variants || [],
      seoTitle,
      seoDescription,
      seoKeywords,
      createdBy: req.user.id
    });

    await product.save();

    // Populate category information
    await product.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateAdminProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      subCategory,
      price,
      originalPrice,
      stock,
      sku,
      weight,
      ingredients,
      brewingInstructions,
      origin,
      grade,
      harvestSeason,
      caffeine,
      flavorProfile,
      healthBenefits,
      storageInstructions,
      certifications,
      isActive,
      isFeatured,
      isBestseller,
      isNewArrival,
      images,
      mainImage,
      tags,
      variants,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if category exists if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category selected'
        });
      }
    }

    // Check if SKU already exists (excluding current product)
    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({ 
        sku, 
        _id: { $ne: req.params.id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (category !== undefined) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (price !== undefined) product.price = parseFloat(price);
    if (originalPrice !== undefined) product.originalPrice = originalPrice ? parseFloat(originalPrice) : undefined;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (sku !== undefined) product.sku = sku;
    if (weight !== undefined) product.weight = weight;
    if (ingredients !== undefined) product.ingredients = ingredients;
    if (brewingInstructions !== undefined) product.brewingInstructions = brewingInstructions;
    if (origin !== undefined) product.origin = origin;
    if (grade !== undefined) product.grade = grade;
    if (harvestSeason !== undefined) product.harvestSeason = harvestSeason;
    if (caffeine !== undefined) product.caffeine = caffeine;
    if (flavorProfile !== undefined) product.flavorProfile = flavorProfile;
    if (healthBenefits !== undefined) product.healthBenefits = healthBenefits;
    if (storageInstructions !== undefined) product.storageInstructions = storageInstructions;
    if (certifications !== undefined) product.certifications = certifications;
    if (isActive !== undefined) product.isActive = isActive;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isBestseller !== undefined) product.isBestseller = isBestseller;
    if (isNewArrival !== undefined) product.isNewArrival = isNewArrival;
    if (images !== undefined) product.images = images;
    if (mainImage !== undefined) product.mainImage = mainImage;
    if (tags !== undefined) product.tags = tags;
    if (variants !== undefined) product.variants = variants;
    if (seoTitle !== undefined) product.seoTitle = seoTitle;
    if (seoDescription !== undefined) product.seoDescription = seoDescription;
    if (seoKeywords !== undefined) product.seoKeywords = seoKeywords;

    product.updatedAt = new Date();

    await product.save();

    // Populate category information
    await product.populate('category', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

module.exports = {
  getDashboardData,
  getAdminOrders,
  updateOrderStatus,
  getAdminCustomers,
  getAdminAnalytics,
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
};
