import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaCheckSquare,
  FaSquare,
  FaBars,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import ImageUpload from '../../components/common/ImageUpload';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCategories: 0
  });
  const [filters, setFilters] = useState({
    active: 'all',
    sort: '-createdAt'
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: '',
    isActive: true,
    colorTheme: '#9ACB3C'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // Debug: Track state changes
  useEffect(() => {
    console.log('selectedImage changed:', selectedImage);
  }, [selectedImage]);

  useEffect(() => {
    console.log('existingImage changed:', existingImage);
  }, [existingImage]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    categoriesWithProducts: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, [pagination.currentPage, filters, searchQuery]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 20,
        sort: filters.sort,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.active !== 'all' && { active: filters.active })
      });

      const response = await axios.get(`${API_URL}/admin/categories?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCategories(response.data.data.categories);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/categories/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching category stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSort = (field) => {
    const currentSort = filters.sort;
    let newSort = field;
    
    if (currentSort === field) {
      newSort = `-${field}`;
    } else if (currentSort === `-${field}`) {
      newSort = field;
    }
    
    setFilters(prev => ({ ...prev, sort: newSort }));
  };

  const getSortIcon = (field) => {
    if (filters.sort === field) return <FaSortUp />;
    if (filters.sort === `-${field}`) return <FaSortDown />;
    return <FaSort />;
  };

  const openModal = (mode, category = null) => {
    setModalMode(mode);
    setSelectedCategory(category);
    
    if (mode === 'edit' && category) {
      console.log('Opening edit modal for category:', category);
      console.log('Category image data:', category.image);
      
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        slug: category.slug,
        isActive: category.isActive,
        colorTheme: category.colorTheme || '#9ACB3C'
      });
      
      const existingImg = category.image?.url ? [{ url: category.image.url, public_id: category.image.public_id }] : [];
      console.log('Setting existingImage:', existingImg);
      setExistingImage(existingImg);
      setSelectedImage(null);
    } else {
      setCategoryForm({
        name: '',
        description: '',
        slug: '',
        isActive: true,
        colorTheme: '#9ACB3C'
      });
      setExistingImage([]);
      setSelectedImage(null);
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      slug: '',
      isActive: true,
      colorTheme: '#9ACB3C'
    });
    setSelectedImage(null);
    setExistingImage([]);
  };

  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !prev.slug && { slug: generateSlug(value) })
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      console.log('handleImageUpload called with file:', file);
      console.log('File type:', typeof file);
      console.log('File is File object:', file instanceof File);
      
      if (file) {
        console.log('Setting selectedImage to File object:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        setSelectedImage(file);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error handling image upload:', error);
      return Promise.reject(error);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('=== FORM SUBMIT ===');
      console.log('Modal mode:', modalMode);
      console.log('Selected category:', selectedCategory);
      console.log('Category form:', categoryForm);
      console.log('Selected image:', selectedImage);
      console.log('Selected image is File:', selectedImage instanceof File);
      console.log('Existing image:', existingImage);
      
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form fields
      Object.keys(categoryForm).forEach(key => {
        formData.append(key, categoryForm[key]);
      });
      
      // Add image if selected (new image uploaded)
      if (selectedImage && selectedImage instanceof File) {
        console.log('✅ Adding NEW image to FormData:', {
          name: selectedImage.name,
          size: selectedImage.size,
          type: selectedImage.type
        });
        formData.append('image', selectedImage);
      } else if (modalMode === 'edit' && existingImage && existingImage.length > 0) {
        console.log('ℹ️  Keeping existing image - no new file to upload');
      } else {
        console.log('⚠️  No image selected or available');
      }
      
      // Debug FormData contents
      console.log('📦 FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}:`, value);
        }
      }
      
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      let response;
      if (modalMode === 'add') {
        console.log('🚀 Sending POST request to create category...');
        response = await axios.post(`${API_URL}/admin/categories`, formData, config);
        
        if (response.data.success) {
          console.log('✅ Category created successfully:', response.data);
          toast.success('Category created successfully');
          fetchCategories();
          fetchStats();
          closeModal();
        }
      } else {
        console.log('🚀 Sending PUT request to update category...');
        response = await axios.put(`${API_URL}/admin/categories/${selectedCategory._id}`, formData, config);
        
        if (response.data.success) {
          console.log('✅ Category updated successfully:', response.data);
          toast.success('Category updated successfully');
          fetchCategories();
          fetchStats();
          closeModal();
        }
      }
    } catch (error) {
      console.error('❌ Error saving category:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/admin/categories/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCategories.length === 0) {
      toast.error('Please select categories first');
      return;
    }

    const actionText = action === 'delete' ? 'delete' : (action === 'activate' ? 'activate' : 'deactivate');
    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedCategories.length} categories?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/admin/categories/bulk-action`, {
        action,
        categoryIds: selectedCategories
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Bulk ${actionText} completed successfully`);
        setSelectedCategories([]);
        fetchCategories();
        fetchStats();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error.response?.data?.message || 'Failed to perform bulk action');
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map(cat => cat._id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
        <p className="text-gray-600">Manage product categories and their properties</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaTags size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Categories</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaEye size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Categories</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeCategories}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <FaEyeSlash size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Inactive Categories</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.inactiveCategories}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaBars size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">With Products</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.categoriesWithProducts}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.active}
              onChange={(e) => handleFilterChange('active', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          <div className="flex gap-2">
            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Activate ({selectedCategories.length})
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Deactivate ({selectedCategories.length})
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete ({selectedCategories.length})
                </button>
              </div>
            )}

            <button
              onClick={() => openModal('add')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus size={16} />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {selectedCategories.length === categories.length ? (
                      <FaCheckSquare />
                    ) : (
                      <FaSquare />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    Name {getSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    Created {getSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSelectCategory(category._id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {selectedCategories.includes(category._id) ? (
                        <FaCheckSquare />
                      ) : (
                        <FaSquare />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">/{category.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {category.description || 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {category.productCount || 0} products
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal('edit', category)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Edit category"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Delete category"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalCategories} total categories)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' ? 'Add New Category' : 'Edit Category'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={categoryForm.slug}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="URL-friendly slug (auto-generated if empty)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used in URLs. Leave empty to auto-generate from name.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={categoryForm.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter category description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <ImageUpload
                    type="single"
                    maxFiles={1}
                    maxSize={3}
                    onUpload={handleImageUpload}
                    onRemove={handleImageRemove}
                    existingImages={existingImage}
                    className="w-full"
                    accept="image/*"
                    label="Upload Category Image"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image to represent this category. Recommended size: 400x400px.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="colorTheme"
                      value={categoryForm.colorTheme}
                      onChange={handleFormChange}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      name="colorTheme"
                      value={categoryForm.colorTheme}
                      onChange={handleFormChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="#9ACB3C"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a theme color for this category.
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={categoryForm.isActive}
                      onChange={handleFormChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active Category</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Only active categories will be visible to customers.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {modalMode === 'add' ? 'Create Category' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
