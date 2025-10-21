import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBox, 
  FaShippingFast, 
  FaCheckCircle, 
  FaTimesCircle,
  FaEye,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaTruck,
  FaMapMarkerAlt,
  FaPhone,
  FaSyncAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';


const API_URL = import.meta.env.VITE_API_URL || '/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  // Debug: Log state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Orders state changed:', {
        ordersCount: Array.isArray(orders) ? orders.length : 'Not array',
        filteredCount: Array.isArray(filteredOrders) ? filteredOrders.length : 'Not array',
        loading,
        searchTerm,
        statusFilter
      });
    }
  }, [orders, filteredOrders, loading, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to view orders');
        setLoading(false);
        return;
      }

      console.log('Fetching orders from:', `${API_URL}/orders`);

      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Orders API response:', response.data);

      if (response.data.success && response.data.data) {
        // The backend returns { success: true, data: { orders: [...], pagination: {...} } }
        const ordersData = Array.isArray(response.data.data.orders) ? response.data.data.orders : [];
        console.log('Parsed orders data:', ordersData);
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        
        if (ordersData.length === 0) {
          console.log('No orders found for user');
        } else {
          console.log(`Successfully loaded ${ordersData.length} orders`);
        }
      } else {
        console.warn('API response structure unexpected:', response.data);
        setOrders([]);
        setFilteredOrders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        toast.error('Please login again to view orders');
        // Could redirect to login here if needed
      } else if (error.response?.status === 404) {
        toast.error('Orders service not found');
      } else {
        toast.error(`Failed to load orders: ${error.response?.data?.message || error.message}`);
      }
      
      setOrders([]);
      setFilteredOrders([]);
      setLoading(false);
    }
  };

  const filterOrders = () => {
    // Ensure orders is an array before filtering
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders]; // Create a copy to avoid mutations

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order?.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order?.items?.some(item => item?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order?.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <FaShippingFast className="w-4 h-4" />;
      case 'processing':
        return <FaBox className="w-4 h-4" />;
      case 'cancelled':
        return <FaTimesCircle className="w-4 h-4" />;
      default:
        return <FaBox className="w-4 h-4" />;
    }
  };

  const handleTrackOrder = (trackingNumber) => {
    if (trackingNumber) {
      toast.success(`Tracking order: ${trackingNumber}`);
      // In a real app, this would open a tracking page or modal
    } else {
      toast.info('Tracking information not available yet');
    }
  };

  const handleCancelOrder = async (orderId, orderNumber) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${orderNumber}?\n\nNote: Cancellation is only possible within 24 hours of placing the order.`
    );

    if (!confirmed) return;

    const loadingToast = toast.loading('Cancelling order...');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        { reason: 'Cancelled by customer' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Order cancelled successfully! Refund will be processed within 5-7 business days.', {
          id: loadingToast,
          duration: 5000
        });
        // Refresh orders
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order. Please try again.', {
        id: loadingToast
      });
    }
  };

  const canCancelOrder = (order) => {
    if (!order) return false;
    
    // Check if order status allows cancellation
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return false;
    }

    // Check if order is within 24 hours
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - orderTime) / (1000 * 60 * 60);

    return hoursPassed <= 24;
  };

  const getTimeLeftToCancel = (order) => {
    if (!order || !order.createdAt) return null;
    
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursLeft = 24 - ((currentTime - orderTime) / (1000 * 60 * 60));

    if (hoursLeft <= 0) return null;
    
    if (hoursLeft < 1) {
      return `${Math.floor(hoursLeft * 60)} minutes left`;
    }
    
    return `${Math.floor(hoursLeft)} hours left`;
  };

  const handleDownloadInvoice = (orderNumber) => {
    toast.success(`Downloading invoice for ${orderNumber}`);
    // In a real app, this would download the invoice PDF
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const orderStatuses = [
    { value: '', label: 'All Orders' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">Track and manage your tea orders</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by order number or product..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {Array.isArray(filteredOrders) ? filteredOrders.length : 0} of {Array.isArray(orders) ? orders.length : 0} orders
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          <AnimatePresence>
            {Array.isArray(filteredOrders) && filteredOrders.map((order, index) => (
              <motion.div
                key={order._id || order.id || `order-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber || 'N/A'}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaCalendarAlt className="w-4 h-4 mr-1" />
                          Placed on {formatDate(order.createdAt || order.orderDate || order.date)}
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusIcon(order.status || 'pending')}
                        <span className="ml-1 capitalize">{order.status || 'pending'}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-lg font-bold text-gray-900">₹{order.total || order.totalPrice || 0}</p>
                      <p className="text-sm text-gray-600">{Array.isArray(order.items) ? order.items.length : 0} item(s)</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {Array.isArray(order.items) && order.items.map((item, itemIndex) => {
                      // Handle both populated and unpopulated product data
                      const productData = item.product || {};
                      const productName = productData.name || item.name || 'Unknown Item';
                      const productImage = productData.mainImage?.url || 
                                          productData.images?.[0]?.url || 
                                          item.image || 
                                          item.mainImage?.url || 
                                          DEFAULT_PRODUCT_IMAGE;
                      
                      return (
                        <div key={item._id || item.id || `${order._id}-item-${itemIndex}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity || 1} × ₹{item.price || 0}
                              {item.variant && <span className="ml-1 text-gray-500">({item.variant})</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                      <span className="truncate">
                        {order.shippingAddress?.addressLine1 || 
                         order.shipping?.address?.split(',')[0] || 
                         order.shippingAddress?.fullName || 
                         'Address not available'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Cancel Button - Show if order can be cancelled */}
                      {canCancelOrder(order) && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => handleCancelOrder(order._id, order.orderNumber)}
                            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-md transition-colors"
                          >
                            <FaTimesCircle className="w-4 h-4 mr-1" />
                            Cancel Order
                          </button>
                          {getTimeLeftToCancel(order) && (
                            <span className="text-xs text-orange-600 font-medium">
                              ⏰ {getTimeLeftToCancel(order)} to cancel
                            </span>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetail(true);
                        }}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <FaEye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      
                      {order.shipping?.trackingNumber && (
                        <button
                          onClick={() => handleTrackOrder(order.shipping.trackingNumber)}
                          className="inline-flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                        >
                          <FaTruck className="w-4 h-4 mr-1" />
                          Track
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleDownloadInvoice(order.orderNumber || order._id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <FaDownload className="w-4 h-4 mr-1" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {Array.isArray(filteredOrders) && filteredOrders.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaBox className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filter criteria'
                : "You haven't placed any orders yet"
              }
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
          </motion.div>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {showOrderDetail && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                    <button
                      onClick={() => setShowOrderDetail(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  {/* Order Info */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Number</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedOrder?.orderNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order Date</p>
                        <p className="text-gray-900">{formatDate(selectedOrder?.createdAt || selectedOrder?.orderDate || selectedOrder?.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder?.status || 'pending')}`}>
                          {getStatusIcon(selectedOrder?.status || 'pending')}
                          <span className="ml-1 capitalize">{selectedOrder?.status || 'pending'}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">₹{selectedOrder?.total || selectedOrder?.totalPrice || 0}</p>
                      </div>
                    </div>

                    {/* Order Timeline */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h4>
                      <div className="space-y-3">
                        {Array.isArray(selectedOrder?.timeline) && selectedOrder.timeline.length > 0 ? 
                          selectedOrder.timeline.map((event, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className={`w-3 h-3 rounded-full mt-1 ${
                              event?.status === 'delivered' ? 'bg-green-500' :
                              event?.status === 'shipped' ? 'bg-blue-500' :
                              event?.status === 'confirmed' ? 'bg-yellow-500' :
                              event?.status === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{event?.description || 'Status updated'}</p>
                              <p className="text-xs text-gray-600">{formatDate(event?.date || event?.createdAt)}</p>
                            </div>
                          </div>
                        )) : (
                          <div className="flex items-start space-x-3">
                            <div className="w-3 h-3 rounded-full mt-1 bg-blue-500"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Order Placed</p>
                              <p className="text-xs text-gray-600">{formatDate(selectedOrder?.createdAt || selectedOrder?.orderDate)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Shipping Info */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Shipping Information</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">Delivery Address:</p>
                        <p className="text-gray-900">
                          {selectedOrder?.shippingAddress?.addressLine1 || 
                           selectedOrder?.shipping?.address || 
                           'Address not available'}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Shipping Method: {selectedOrder?.shipping?.method || 'Standard Delivery'}
                        </p>
                        {selectedOrder?.shipping?.trackingNumber && (
                          <p className="text-sm text-gray-600">Tracking: {selectedOrder.shipping.trackingNumber}</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {Array.isArray(selectedOrder?.items) && selectedOrder.items.map((item, itemIndex) => {
                          // Handle both populated and unpopulated product data
                          const productData = item.product || {};
                          const productName = productData.name || item.name || 'Unknown Item';
                          const productImage = productData.mainImage?.url || 
                                              productData.images?.[0]?.url || 
                                              item.image || 
                                              item.mainImage?.url || 
                                              DEFAULT_PRODUCT_IMAGE;
                          
                          return (
                            <div key={item._id || item.id || `modal-item-${itemIndex}`} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{productName}</h5>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity}
                                  {item.variant && <span className="ml-2 text-gray-500">({item.variant})</span>}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">₹{(item.price * item.quantity)}</p>
                                <p className="text-sm text-gray-600">₹{item.price} each</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Orders;
