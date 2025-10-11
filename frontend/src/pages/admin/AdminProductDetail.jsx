import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaStar,
  FaBox,
  FaRupeeSign,
  FaEye,
  FaHeart,
  FaMedal,
  FaExclamationCircle
} from 'react-icons/fa';
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Make actual API call to fetch product
      const response = await axios.get(`${API_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/admin/login');
        return;
      }

      await axios.delete(`${API_URL}/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Product deleted successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const toggleStatus = async (field) => {
    try {
      const token = localStorage.getItem('token');
      const newValue = !product[field];
      
      const response = await fetch(`/api/admin/products/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [field]: newValue
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product status');
      }

      // Update the product state with the response data
      setProduct(data.data);
      toast.success(data.message || `Product ${field} updated successfully`);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error(error.message || `Failed to update product ${field}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-96 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-40 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
        <Link
          to="/admin/products"
          className="mt-4 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
        >
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/products"
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/admin/products/${product._id}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaTrash className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Images */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-w-16 aspect-h-12">
              <img
                src={getProductImageSrc(product.images?.[selectedImage] || product.mainImage || product)}
                alt={product.images?.[selectedImage]?.alt || product.mainImage?.alt || product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={getProductImageSrc(image)}
                      alt={image.alt || product.name}
                      className="w-full h-20 object-cover"
                      onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
            {product.isFeatured && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                Featured
              </span>
            )}
            {product.isBestseller && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                Bestseller
              </span>
            )}
            {product.isOrganic && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                Organic
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaRupeeSign className="w-5 h-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-lg font-semibold text-gray-900">₹{product.price || 0}</p>
                  {product.originalPrice && product.price && product.originalPrice > product.price && (
                    <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaBox className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Stock</p>
                  <p className="text-lg font-semibold text-gray-900">{product.stock || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaStar className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-semibold text-gray-900">{product.averageRating || 0}/5</p>
                  <p className="text-sm text-gray-500">({product.totalReviews || 0} reviews)</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <FaMedal className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Sales</p>
                  <p className="text-lg font-semibold text-gray-900">{product.totalSales || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Engagement</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaEye className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Views</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{(product.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaHeart className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600">Wishlist</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{product.wishlistCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => toggleStatus('isActive')}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  product.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {product.isActive ? 'Deactivate Product' : 'Activate Product'}
              </button>
              <button
                onClick={() => toggleStatus('isFeatured')}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  product.isFeatured
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
              </button>
              <button
                onClick={() => toggleStatus('isBestseller')}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  product.isBestseller
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {product.isBestseller ? 'Remove from Bestsellers' : 'Mark as Bestseller'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <p className="text-sm text-gray-900">{product.sku || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <p className="text-sm text-gray-900 capitalize">{product.category?.name || product.category || 'Not specified'} Tea</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight</label>
              <p className="text-sm text-gray-900">{product.weight ? `${product.weight}g` : 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Origin</label>
              <p className="text-sm text-gray-900">{product.origin || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <p className="text-sm text-gray-900">{product.grade || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Harvest Season</label>
              <p className="text-sm text-gray-900">{product.harvestSeason || 'Not specified'}</p>
            </div>
          </div>
        </motion.div>

        {/* Tea Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tea Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Caffeine Level</label>
              <p className="text-sm text-gray-900">{product.caffeineLevel || product.caffeine || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flavor Profile</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {(product.flavorProfile || []).map((flavor, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    {flavor}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Health Benefits</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {(product.benefits || product.healthBenefits || []).map((benefit, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingredients</label>
              <p className="text-sm text-gray-900">{Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients || 'Not specified'}</p>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
              <p className="text-sm text-gray-900">{product.shortDescription || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
              <p className="text-sm text-gray-900 leading-relaxed">{product.description || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brewing Instructions</label>
              <p className="text-sm text-gray-900">{product.brewingInstructions || 'Not provided'}</p>
            </div>
          </div>
        </motion.div>

        {/* SEO Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SEO Title</label>
              <p className="text-sm text-gray-900">{product.seo?.title || product.seoTitle || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SEO Description</label>
              <p className="text-sm text-gray-900">{product.seo?.description || product.seoDescription || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Keywords</label>
              <p className="text-sm text-gray-900">{product.seo?.keywords || product.seoKeywords || 'Not set'}</p>
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Storage Instructions</label>
              <p className="text-sm text-gray-900">{product.storageInstructions || 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Shelf Life</label>
              <p className="text-sm text-gray-900">{product.shelfLife || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="text-sm text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Updated</label>
              <p className="text-sm text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>
      </div>

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
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
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

export default AdminProductDetail;
