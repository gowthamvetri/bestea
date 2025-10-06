import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaStar,
  FaBoxes,
  FaExclamationCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple rate limiting to prevent 429 errors
const createRateLimitedFunction = (fn, delay = 1000) => {
  let lastCall = 0;
  return async (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    if (timeSinceLastCall < delay) {
      await new Promise(resolve => setTimeout(resolve, delay - timeSinceLastCall));
    }
    lastCall = Date.now();
    return fn(...args);
  };
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([{ value: '', label: 'All Categories' }]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Add refs to prevent duplicate API calls
  const fetchProductsRef = useRef(null);
  const fetchCategoriesRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    // Only fetch categories once
    if (fetchCategoriesRef.current) return;
    fetchCategoriesRef.current = true;
    fetchCategories();
  }, []);

  // Debounced effect for search and filters
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to first page when filters change
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchProducts();
      }
    }, 300); // 300ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedCategory, sortBy, sortOrder, statusFilter]);

  // Separate effect for page changes (no debounce needed)
  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cancel any pending requests on unmount
      if (fetchProductsRef.current) {
        fetchProductsRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Add pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Remove the filterProducts useEffect since we're doing server-side filtering

  const fetchProducts = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchProductsRef.current) {
      fetchProductsRef.current.abort();
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Create abort controller for this request
      const controller = new AbortController();
      fetchProductsRef.current = controller;
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
        sortBy,
        sortOrder
      });

      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active');

      const response = await axios.get(`${API_URL}/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });

      if (response.data.success) {
        const productsData = Array.isArray(response.data.data?.products) 
          ? response.data.data.products 
          : Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        setTotalProducts(response.data.data?.total || productsData.length);
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setTotalProducts(0);
      }
      setIsLoading(false);
      fetchProductsRef.current = null;
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        // Request was aborted, don't show error
        return;
      }
      console.error('Error fetching products:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to load products');
      }
      setProducts([]);
      setFilteredProducts([]);
      setTotalProducts(0);
      setIsLoading(false);
      fetchProductsRef.current = null;
    }
  }, [currentPage, productsPerPage, sortBy, sortOrder, searchTerm, selectedCategory, statusFilter]);

  const fetchCategories = useCallback(createRateLimitedFunction(async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      if (response.data.success) {
        const categoryOptions = [
          { value: '', label: 'All Categories' },
          ...response.data.data.map(cat => ({
            value: cat.slug || cat.name.toLowerCase(),
            label: cat.name
          }))
        ];
        setCategories(categoryOptions);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      // Set default categories if API fails
      setCategories([
        { value: '', label: 'All Categories' },
        { value: 'black', label: 'Black Tea' },
        { value: 'green', label: 'Green Tea' },
        { value: 'white', label: 'White Tea' },
        { value: 'oolong', label: 'Oolong Tea' },
        { value: 'herbal', label: 'Herbal Tea' },
        { value: 'chai', label: 'Chai' }
      ]);
    }
  }, 500), []);

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/products/${productToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Remove from local state immediately for better UX
        setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
        setFilteredProducts(prev => prev.filter(p => p._id !== productToDelete._id));
        
        // Also refresh the data to ensure consistency
        fetchProducts();
        
        toast.success('Product deleted successfully');
        setShowDeleteModal(false);
        setProductToDelete(null);
      } else {
        toast.error(response.data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const toggleProductStatus = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/admin/products/${productId}/status`,
        { isActive: !currentStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProducts(prev => prev.map(p => 
          p._id === productId ? { ...p, isActive: !currentStatus } : p
        ));
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(response.data.message || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error.response?.data?.message || 'Failed to update product status');
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'black': 'bg-gray-100 text-gray-800',
      'green': 'bg-green-100 text-green-800',
      'white': 'bg-blue-100 text-blue-800',
      'oolong': 'bg-yellow-100 text-yellow-800',
      'herbal': 'bg-purple-100 text-purple-800',
      'flavored': 'bg-pink-100 text-pink-800',
      'chai': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-48 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your tea products inventory</p>
        </div>
        <Link
          to="/admin/products/add"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Add New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, category..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
              <option value="sales">Sales</option>
              <option value="averageRating">Rating</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {Array.isArray(filteredProducts) ? filteredProducts.length : 0} of {totalProducts} products
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setStatusFilter('active');
                setSortBy('createdAt');
                setSortOrder('desc');
                setCurrentPage(1);
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchProducts}
              className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800 border border-orange-300 rounded-md hover:bg-orange-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {Array.isArray(filteredProducts) && filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={getProductImageSrc(product)}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                />
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.isActive)}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Featured
                    </span>
                  )}
                  {product.isBestseller && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Bestseller
                    </span>
                  )}
                  {product.stock <= 10 && product.stock > 0 && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Low Stock
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(product.category)}`}>
                    {product.category || 'Uncategorized'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2 truncate" title={product.name}>
                  {product.name}
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.averageRating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-600">
                      {(product.averageRating || 0).toFixed(1)} ({product.totalReviews || 0})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">₹{(product.price || 0).toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-green-600 font-medium">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${
                    product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    Stock: {product.stock || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Sales: {product.sales || 0}</span>
                  <span>Views: {product.views || 0}</span>
                  <span>
                    {product.createdAt 
                      ? new Date(product.createdAt).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'No date'
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                      title="Edit Product"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Product"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => toggleProductStatus(product._id, product.isActive)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      product.isActive
                        ? 'text-red-700 bg-red-100 hover:bg-red-200'
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FaBoxes className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first product'
            }
          </p>
          <Link
            to="/admin/products/add"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNumber
                      ? 'text-orange-600 bg-orange-50 border border-orange-500'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center mb-4">
                <FaExclamationCircle className="w-6 h-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Delete Product</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
