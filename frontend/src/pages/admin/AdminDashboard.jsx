import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaBoxes, 
  FaShoppingCart, 
  FaUsers, 
  FaRupeeSign,
  FaChartLine,
  FaExclamationTriangle,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaStar,
  FaEye
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    lowStockProducts: [],
    recentActivities: [],
    salesTrend: [],
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    dailyOrders: 0,
    topCategories: [],
    recentReviews: [],
    isLoading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access admin panel');
        return;
      }

      // Fetch multiple endpoints for comprehensive dashboard data
      const [
        dashboardResponse,
        analyticsResponse,
        productsResponse,
        ordersResponse,
        reviewsResponse
      ] = await Promise.all([
        axios.get(`${API_URL}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/admin/analytics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/products?limit=5&lowStock=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/orders?limit=10&status=pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } })),
        axios.get(`${API_URL}/admin/reviews?limit=5&recent=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => ({ data: { success: false } }))
      ]);

      if (dashboardResponse.data.success) {
        const dashboardData = dashboardResponse.data.data;
        
        setStats(prevStats => ({
          ...prevStats,
          // Basic stats
          totalProducts: dashboardData.overview?.totalProducts || 0,
          totalOrders: dashboardData.overview?.totalOrders || 0,
          totalCustomers: dashboardData.overview?.totalCustomers || 0,
          totalRevenue: dashboardData.overview?.totalRevenue || 0,
          recentOrders: dashboardData.recentOrders || [],
          topProducts: dashboardData.topProducts || [],
          
          // Additional stats from analytics
          pendingOrders: analyticsResponse.data.success ? analyticsResponse.data.data?.pendingOrders || 0 : 0,
          completedOrders: analyticsResponse.data.success ? analyticsResponse.data.data?.completedOrders || 0 : 0,
          monthlyRevenue: analyticsResponse.data.success ? analyticsResponse.data.data?.monthlyRevenue || 0 : 0,
          dailyOrders: analyticsResponse.data.success ? analyticsResponse.data.data?.dailyOrders || 0 : 0,
          salesTrend: analyticsResponse.data.success ? analyticsResponse.data.data?.salesTrend || [] : [],
          topCategories: analyticsResponse.data.success ? analyticsResponse.data.data?.topCategories || [] : [],
          
          // Low stock products
          lowStockProducts: productsResponse.data.success ? productsResponse.data.data?.products || [] : [],
          
          // Recent reviews
          recentReviews: reviewsResponse.data.success ? reviewsResponse.data.data?.reviews || [] : [],
          
          // Recent activities (combine various activities)
          recentActivities: [
            ...(dashboardData.recentOrders || []).slice(0, 3).map(order => ({
              type: 'order',
              message: `New order #${order.orderNumber || order._id?.slice(-8)} placed`,
              time: order.createdAt || order.orderDate,
              icon: FaShoppingCart,
              color: 'text-green-600'
            })),
            ...(reviewsResponse.data.success ? (reviewsResponse.data.data?.reviews || []).slice(0, 2).map(review => ({
              type: 'review',
              message: `New ${review.rating}-star review for ${review.product?.name}`,
              time: review.createdAt,
              icon: FaStar,
              color: 'text-yellow-600'
            })) : []),
            ...(productsResponse.data.success ? (productsResponse.data.data?.products || []).slice(0, 2).map(product => ({
              type: 'stock',
              message: `Low stock alert: ${product.name} (${product.stock} left)`,
              time: new Date().toISOString(),
              icon: FaExclamationTriangle,
              color: 'text-red-600'
            })) : [])
          ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8),
          
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: FaBoxes,
      color: 'bg-green-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      icon: FaUsers,
      color: 'bg-purple-500',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: FaRupeeSign,
      color: 'bg-green-500',
      trend: '+22%',
      trendUp: true
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders || 0,
      icon: FaClock,
      color: 'bg-yellow-500',
      urgent: stats.pendingOrders > 10
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`,
      icon: FaChartLine,
      color: 'bg-indigo-500',
      trend: '+18%',
      trendUp: true
    },
    {
      title: 'Daily Orders',
      value: stats.dailyOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-pink-500'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-emerald-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (stats.isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gray-200 rounded-lg shadow-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-2 w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2 w-2/3"></div>
                  <div className="h-8 bg-gray-300 rounded mb-2 w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grids Skeleton */}
        {[...Array(3)].map((_, gridIndex) => (
          <div key={gridIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, cardIndex) => (
              <div key={cardIndex} className="bg-white rounded-lg shadow animate-pulse">
                <div className="p-6 border-b border-gray-200">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[...Array(3)].map((_, itemIndex) => (
                    <div key={itemIndex} className="h-16 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-green-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to BESTEA Admin Panel</h1>
        <p className="text-green-100">Manage your tea business efficiently and grow your sales</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card.Stats
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            trendUp={card.trendUp}
            urgent={card.urgent}
            color={card.color}
            delay={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card 
          hover={true}
          className="overflow-hidden"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 font-playfair">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="text-green-400 hover:text-special-500 text-sm font-bold font-inter tracking-wide"
              >
                View all →
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Array.isArray(stats.recentOrders) && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order, index) => (
                  <motion.div 
                    key={order._id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100/60 hover:border-green-400/20 hover:bg-gradient-to-r hover:from-green-400/5 hover:to-special-500/5 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <p className="font-bold text-gray-900 font-inter">#{order.orderNumber || order._id?.slice(-8)}</p>
                      <p className="text-sm text-gray-600 font-medium">{order.customerName || order.user?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400 text-lg">₹{(order.amount || order.totalAmount || 0).toLocaleString()}</p>
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-2xl ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <FaShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium">No recent orders</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Top Products */}
        <Card 
          hover={true}
          className="overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 font-playfair">Top Products</h3>
              <Link
                to="/admin/products"
                className="text-green-400 hover:text-special-500 text-sm font-bold font-inter tracking-wide"
              >
                View all →
              </Link>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {Array.isArray(stats.topProducts) && stats.topProducts.length > 0 ? (
                stats.topProducts.map((product, index) => (
                  <motion.div 
                    key={product._id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100/60 hover:border-green-400/20 hover:bg-gradient-to-r hover:from-green-400/5 hover:to-special-500/5 transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-special-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-sm font-bold text-white">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 font-inter">{product.name}</p>
                        <p className="text-sm text-gray-600 font-medium">{product.sales || 0} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400 text-lg">₹{(product.revenue || 0).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                    <FaBoxes className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium">No top products data</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Low Stock Alerts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Low Stock Alerts</h3>
              </div>
              <Link
                to="/admin/products?filter=low-stock"
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.isArray(stats.lowStockProducts) && stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-red-600">Only {product.stock} left in stock</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(product.price || 0).toLocaleString()}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Low Stock
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBoxes className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>All products are well stocked</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaClock className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.isArray(stats.recentActivities) && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, index) => {
                  const ActivityIcon = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100`}>
                        <ActivityIcon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.time).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaClock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Categories & Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaChartLine className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Top Categories</h3>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.isArray(stats.topCategories) && stats.topCategories.length > 0 ? (
                stats.topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-purple-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.products} products</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{(category.revenue || 0).toLocaleString()}</p>
                      <p className="text-sm text-purple-600">{category.sales} sales</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaChartLine className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaStar className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
              </div>
              <Link
                to="/admin/reviews"
                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.isArray(stats.recentReviews) && stats.recentReviews.length > 0 ? (
                stats.recentReviews.map((review) => (
                  <div key={review._id} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{review.product?.name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        by {review.user?.name} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaStar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent reviews</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products/add"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <FaBoxes className="w-5 h-5 text-green-600 mr-3" />
            <span className="font-medium text-green-900">Add New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <FaShoppingCart className="w-5 h-5 text-green-600 mr-3" />
            <span className="font-medium text-green-900">Manage Orders</span>
          </Link>
          <Link
            to="/admin/customers"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FaUsers className="w-5 h-5 text-purple-600 mr-3" />
            <span className="font-medium text-purple-900">View Customers</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
