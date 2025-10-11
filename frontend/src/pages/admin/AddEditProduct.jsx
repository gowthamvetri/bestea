import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaSave, 
  FaArrowLeft, 
  FaUpload, 
  FaPlus, 
  FaTrash,
  FaImage,
  FaStar,
  FaInfoCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AddEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    weight: '',
    ingredients: '',
    brewingInstructions: '',
    origin: '',
    grade: '',
    harvestSeason: '',
    caffeineLevel: '',
    blendType: '',
    strength: '',
    flavorProfile: [],
    benefits: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    isOrganic: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const flavorOptions = [
    'Bold', 'Smooth', 'Malty', 'Fruity', 'Floral', 'Earthy', 'Sweet', 'Spicy', 'Citrusy', 'Woody'
  ];

  const benefitOptions = [
    'Antioxidants', 'Energy Boost', 'Digestive Health', 'Heart Health', 'Weight Management', 
    'Stress Relief', 'Immunity Boost', 'Anti-inflammatory', 'Detox', 'Mental Clarity'
  ];

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axios.get(`${API_URL}/categories`);
      
      // Handle both direct array and wrapped response formats
      const categoriesData = response.data?.categories || response.data;
      
      if (categoriesData && Array.isArray(categoriesData)) {
        const categoryOptions = categoriesData.map(cat => ({
          value: cat._id,
          label: cat.name,
          slug: cat.slug
        }));
        setCategories(categoryOptions);
      } else {
        throw new Error('Invalid categories data format');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories. Using fallback categories.');
      // Set fallback categories if API fails
      setCategories([
        { value: 'black', label: 'Black Tea' },
        { value: 'green', label: 'Green Tea' },
        { value: 'white', label: 'White Tea' },
        { value: 'oolong', label: 'Oolong Tea' },
        { value: 'herbal', label: 'Herbal Tea' },
        { value: 'flavored', label: 'Flavored Tea' },
        { value: 'chai', label: 'Chai Blends' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch categories on component mount
    fetchCategories();
    
    if (isEditMode) {
      fetchProduct();
    }
  }, [id, isEditMode]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`${API_URL}/admin/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const product = response.data.data;
        
        // Set form data from API response
        setFormData({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          category: product.category?._id || product.category || '',
          subCategory: product.subCategory || '',
          price: product.price ? product.price.toString() : '',
          originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
          stock: product.stock ? product.stock.toString() : '',
          sku: product.sku || '',
          weight: product.weight || '',
          ingredients: product.ingredients || '',
          brewingInstructions: product.brewingInstructions || '',
          origin: product.origin || '',
          grade: product.grade || '',
          harvestSeason: product.harvestSeason || '',
          caffeineLevel: product.caffeine || '',
          blendType: product.blendType || '',
          strength: product.strength || '',
          flavorProfile: product.flavorProfile || [],
          benefits: product.healthBenefits || [],
          storageInstructions: product.storageInstructions || '',
          certifications: product.certifications || [],
          isActive: product.isActive !== undefined ? product.isActive : true,
          isFeatured: product.isFeatured || false,
          isBestseller: product.isBestseller || false,
          isNewArrival: product.isNewArrival || false,
          seoTitle: product.seoTitle || '',
          seoDescription: product.seoDescription || '',
          seoKeywords: product.seoKeywords || ''
        });

        // Set images
        if (product.images && product.images.length > 0) {
          setImages(product.images.map(img => ({
            url: img.url || img,
            alt: img.alt || product.name
          })));
          
          // Set main image index
          if (product.mainImage) {
            const mainIndex = product.images.findIndex(img => 
              (img.url || img) === product.mainImage
            );
            setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
          }
        }

        // Set tags
        if (product.tags && product.tags.length > 0) {
          setTags(product.tags);
        }
      } else {
        toast.error(response.data.message || 'Failed to load product');
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load product';
      toast.error(errorMessage);
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          url: event.target.result,
          alt: file.name,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (mainImageIndex >= images.length - 1) {
      setMainImageIndex(0);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors and try again');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required');
        navigate('/admin/login');
        return;
      }

      // Prepare form data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        tags: formData.tags || [],
        flavorProfile: formData.flavorProfile || [],
        healthBenefits: formData.benefits || [],
        caffeine: formData.caffeineLevel,
        blendType: formData.blendType || 'BOP', // Default blend type
        strength: formData.strength || 'Medium', // Default strength
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        isFeatured: formData.isFeatured || false,
        isBestseller: formData.isBestseller || false,
        isNewArrival: formData.isNewArrival || false,
        // Handle images properly - generate unique publicId for each image
        images: images.map((img, index) => ({
          url: img.url,
          publicId: `product_${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}_${index}`,
          alt: img.alt || formData.name,
          isMain: index === mainImageIndex
        })),
        mainImage: images[mainImageIndex]?.url || images[0]?.url
      };

      let response;
      
      if (isEditMode) {
        // Update existing product
        response = await axios.put(`${API_URL}/admin/products/${id}`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new product
        response = await axios.post(`${API_URL}/admin/products`, productData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.data.success) {
        toast.success(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/admin/products');
      } else {
        toast.error(response.data.message || 'Failed to save product');
      }
      
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Product SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={categoriesLoading}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    } ${categoriesLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                    </option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <input
                    type="text"
                    name="origin"
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Assam, India"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blend Type *
                  </label>
                  <select
                    name="blendType"
                    value={formData.blendType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Blend Type</option>
                    <option value="BOP">BOP (Broken Orange Pekoe)</option>
                    <option value="BOPSM">BOPSM (Broken Orange Pekoe Special Mix)</option>
                    <option value="PD">PD (Pekoe Dust)</option>
                    <option value="Dust">Dust</option>
                    <option value="OF">OF (Orange Fannings)</option>
                    <option value="Orthodox">Orthodox</option>
                    <option value="Green">Green</option>
                    <option value="CTC">CTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength *
                  </label>
                  <select
                    name="strength"
                    value={formData.strength}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Strength</option>
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Strong">Strong</option>
                    <option value="Extra Strong">Extra Strong</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Brief product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Detailed product description..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </motion.div>

            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Images <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-sm text-gray-600">
                      <label className="cursor-pointer text-orange-600 hover:text-orange-800">
                        Click to upload
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>
                      <span> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB each</p>
                  </div>
                  {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className={`w-full h-32 object-cover rounded-lg border-2 ${
                            index === mainImageIndex ? 'border-orange-500' : 'border-gray-200'
                          }`}
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          {index !== mainImageIndex && (
                            <button
                              type="button"
                              onClick={() => setMainImageIndex(index)}
                              className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                              title="Set as main image"
                            >
                              <FaStar className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 bg-white rounded-full shadow-md hover:bg-red-50"
                            title="Remove image"
                          >
                            <FaTrash className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                        {index === mainImageIndex && (
                          <div className="absolute bottom-2 left-2">
                            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">Main</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Visibility</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isBestseller"
                    checked={formData.isBestseller}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bestseller</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isOrganic"
                    checked={formData.isOrganic}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Organic</span>
                </label>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <FaSave className="w-4 h-4 mr-2" />
                  )}
                  {isEditMode ? 'Update Product' : 'Create Product'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
