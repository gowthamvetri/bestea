import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaFilter,
  FaTimes,
  FaExclamationTriangle,
  FaPlus,
  FaMinus,
  FaChevronDown,
  FaTimesCircle,
  FaThLarge,
  FaList
} from 'react-icons/fa';

// Store actions
import { fetchProducts, setFilters, fetchCategories } from '../store/slices/productSlice';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from '../components/common/Card';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: categorySlug } = useParams();
  const { products, isLoading, error, categories } = useSelector(state => state.products);
  const { items: cartItems } = useSelector(state => state.cart);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [localSortBy, setLocalSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list



  const priceOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-100', label: 'Under ₹100' },
    { value: '100-200', label: '₹100 - ₹200' },
    { value: '200-300', label: '₹200 - ₹300' },
    { value: '300-500', label: '₹300 - ₹500' },
    { value: '500+', label: 'Above ₹500' },
  ];

  const sortOptions = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price-asc', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' },
    { value: 'rating-desc', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
  ];

  // Additional filter states
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [weightFilter, setWeightFilter] = useState('');

  // Additional filter options
  const availabilityOptions = [
    { value: '', label: 'All Products' },
    { value: 'in-stock', label: 'In Stock Only' },
    { value: 'on-sale', label: 'On Sale' },
    { value: 'bestseller', label: 'Best Sellers' },
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '4+', label: '4+ Stars' },
    { value: '4.5+', label: '4.5+ Stars' },
    { value: '5', label: '5 Stars Only' },
  ];

  const weightOptions = [
    { value: '', label: 'All Sizes' },
    { value: '50', label: '50g' },
    { value: '100', label: '100g' },
    { value: '250', label: '250g' },
    { value: '500', label: '500g' },
  ];

  useEffect(() => {
    // Fetch categories only once when component mounts
    dispatch(fetchCategories());
  }, [dispatch]);

  // Handle category from URL parameter (both route param and query param)
  useEffect(() => {
    if (categories.length > 0) {
      let categoryToSelect = null;
      
      // Check route parameter first (/shop/category-slug)
      if (categorySlug) {
        categoryToSelect = categories.find(cat => cat.slug === categorySlug);
      }
      
      // If no route param, check query parameter (?category=category-slug)
      if (!categoryToSelect) {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
          // Try to find by slug first, then by ID
          categoryToSelect = categories.find(cat => cat.slug === categoryParam) || 
                           categories.find(cat => cat._id === categoryParam);
        }
      }
      
      if (categoryToSelect && categoryToSelect._id !== selectedCategory) {
        setSelectedCategory(categoryToSelect._id);
        // Update search params to use category ID for consistency
        const newParams = new URLSearchParams(searchParams);
        newParams.set('category', categoryToSelect._id);
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [categorySlug, categories, searchParams, setSearchParams, selectedCategory]);

  useEffect(() => {
    // Debounce product fetching to prevent too many requests
    const timeoutId = setTimeout(() => {
      const params = Object.fromEntries(searchParams);
      dispatch(fetchProducts(params));
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchParams]);

  // Sync local state with URL parameters (excluding category which is handled above)
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    setLocalSortBy(params.sort || 'name-asc');
    setPriceRange(params.price || '');
    setSearchTerm(params.search || '');
    
    // Only update selectedCategory if it's not already handled by the category-specific useEffect above
    if (!categorySlug && !searchParams.get('category')) {
      setSelectedCategory('');
    }
    
    // Handle featured parameter for bestsellers, but only if no explicit availability is set
    if (params.featured === 'true' && !params.availability) {
      setAvailabilityFilter('bestseller');
    } else {
      setAvailabilityFilter(params.availability || '');
    }
    
    setRatingFilter(params.rating || '');
    setWeightFilter(params.weight || '');
  }, [searchParams, categorySlug]);

  // Update product display when products change (with safety check)
  const displayProducts = Array.isArray(products) && products.length > 0 ? products : [];

  // Handle dynamic filter changes
  const handleFilterChange = (filterType, value) => {
    const newParams = { ...Object.fromEntries(searchParams) };
    
    if (value) {
      newParams[filterType] = value;
    } else {
      delete newParams[filterType];
    }
    
    // Remove featured parameter when manually setting filters to avoid conflicts
    if (filterType !== 'featured') {
      delete newParams.featured;
    }
    
    setSearchParams(newParams);
    dispatch(fetchProducts(newParams));
  };

  // Handle dynamic sort changes
  const handleSortChange = (value) => {
    setLocalSortBy(value);
    const newParams = { ...Object.fromEntries(searchParams) };
    
    if (value !== 'name-asc') {
      newParams.sort = value;
    } else {
      delete newParams.sort;
    }
    
    setSearchParams(newParams);
    dispatch(fetchProducts(newParams));
  };

  // Handle add to cart dynamically
  const handleAddToCart = (product) => {
    if (!product || (!product._id && !product.id)) {
      console.error('Invalid product data:', product);
      return;
    }

    const cartItem = {
      product: {
        _id: product._id || product.id,
        name: product.name,
        slug: product.slug,
        mainImage: product.mainImage,
        images: product.images,
        defaultPrice: product.defaultPrice || product.price,
        price: product.price,
        defaultOriginalPrice: product.defaultOriginalPrice || product.originalPrice,
        originalPrice: product.originalPrice,
        stock: product.stock
      },
      quantity: 1
    };
    
    dispatch(addToCart(cartItem));
  };

  const handleIncrementCart = (cartItemId) => {
    const cartItem = cartItems.find(item => item.id === cartItemId);
    if (cartItem) {
      dispatch(updateQuantity({ itemId: cartItemId, quantity: cartItem.quantity + 1 }));
    }
  };

  const handleDecrementCart = (cartItemId) => {
    const cartItem = cartItems.find(item => item.id === cartItemId);
    if (cartItem) {
      if (cartItem.quantity === 1) {
        // Remove from cart when quantity is 1
        dispatch(removeFromCart(cartItemId));
      } else {
        // Decrease quantity
        dispatch(updateQuantity({ itemId: cartItemId, quantity: cartItem.quantity - 1 }));
      }
    }
  };

  // Check if product is already in cart
  const getCartItem = (product) => {
    return cartItems.find(item => item.productId === (product._id || product.id));
  };

  // Filter products based on selected filters (client-side for better UX)
  const filteredProducts = () => {
    let filtered = displayProducts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }



    // Filter by price range
    if (priceRange) {
      filtered = filtered.filter(product => {
        const price = product.defaultPrice || product.price || 0;
        switch (priceRange) {
          case '0-100':
            return price < 100;
          case '100-200':
            return price >= 100 && price < 200;
          case '200-300':
            return price >= 200 && price < 300;
          case '300-500':
            return price >= 300 && price < 500;
          case '500+':
            return price >= 500;
          default:
            return true;
        }
      });
    }

    // Filter by availability
    if (availabilityFilter) {
      console.log('Filtering by availability:', availabilityFilter, 'Total products before filter:', filtered.length);
      filtered = filtered.filter(product => {
        switch (availabilityFilter) {
          case 'in-stock':
            return (product.stock || 0) > 0;
          case 'on-sale':
            return product.defaultOriginalPrice || product.originalPrice;
          case 'bestseller':
            console.log('Checking bestseller for product:', product.name, 'isBestseller:', product.isBestseller, 'badges:', product.badges);
            const isBestseller = product.badges?.includes('Best Seller') || product.isBestseller;
            console.log('Result for', product.name, ':', isBestseller);
            return isBestseller;
          default:
            return true;
        }
      });
      console.log('Products after availability filter:', filtered.length);
    }

    // Filter by rating
    if (ratingFilter) {
      filtered = filtered.filter(product => {
        // Handle multiple possible rating field names and ensure it's a number
        const rating = parseFloat(
          product.averageRating || 
          product.rating || 
          product.starRating || 
          0
        );
        
        switch (ratingFilter) {
          case '4+':
            return rating >= 4.0;
          case '4.5+':
            return rating >= 4.5;
          case '5':
            return rating >= 5.0;
          default:
            return true;
        }
      });
    }

    // Filter by weight
    if (weightFilter) {
      filtered = filtered.filter(product => 
        (product.weight || 100).toString() === weightFilter
      );
    }

    return filtered;
  };

  // Sort products based on selected sort option
  const sortProducts = (products) => {
    const sorted = [...products];
    
    switch (localSortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return sorted.sort((a, b) => (a.defaultPrice || a.price || 0) - (b.defaultPrice || b.price || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.defaultPrice || b.price || 0) - (a.defaultPrice || a.price || 0));
      case 'rating-desc':
        return sorted.sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'popular':
        return sorted.sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));
      default:
        return sorted;
    }
  };

  // Get final products to display
  const finalProducts = sortProducts(filteredProducts());

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = { ...Object.fromEntries(searchParams) };
    if (searchTerm.trim()) {
      newParams.search = searchTerm.trim();
    } else {
      delete newParams.search;
    }
    setSearchParams(newParams);
    dispatch(fetchProducts(newParams));
  };

  // Get current category name for display
  const currentCategory = categories.find(cat => cat._id === selectedCategory);
  const categoryName = currentCategory?.name || '';
  const isBestsellersPage = searchParams.get('featured') === 'true';

  return (
    <>
      <Helmet>
        <title>{isBestsellersPage ? 'Bestsellers - Premium Tea Collection | Bestea' : categoryName ? `${categoryName} Tea - Shop | Bestea` : 'Shop - Premium Tea Collection | Bestea'}</title>
        <meta name="description" content={isBestsellersPage ? "Discover our most popular and bestselling premium teas. Customer favorites sourced directly from the finest plantations." : categoryName ? `Discover our premium ${categoryName} tea collection. Authentic Indian teas sourced directly from plantations.` : "Discover our premium collection of authentic Indian teas. From classic Assam to exotic Darjeeling - find your perfect cup."} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="flex">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed top-20 left-4 z-50">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <FaFilter className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Filter - Enhanced Professional Style */}
          <div className={`w-80 bg-white shadow-xl border-r-2 border-gray-100 min-h-screen transition-transform duration-300 ${
            showFilters ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static top-0 left-0 z-40 lg:z-auto overflow-y-auto`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-2 rounded-lg">
                    <FaFilter className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              {/* Category Filter - Enhanced */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between text-base">
                  Category
                  <button 
                    onClick={() => {
                      handleFilterChange('category', '');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-1">
                  <label className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={selectedCategory === ''}
                      onChange={(e) => {
                        setSelectedCategory('');
                        handleFilterChange('category', '');
                      }}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors text-sm">All Categories</span>
                  </label>
                  {categories.map(category => (
                    <label key={category._id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={selectedCategory === category._id}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('category', value);
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Filter - Enhanced */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between text-base">
                  Price Range
                  <button 
                    onClick={() => {
                      handleFilterChange('price', '');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-1">
                  {priceOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('price', value);
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter - Enhanced */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between text-base">
                  Availability
                  <button 
                    onClick={() => {
                      handleFilterChange('availability', '');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-1">
                  {availabilityOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={availabilityFilter === option.value}
                        onChange={(e) => {
                          const value = e.target.checked ? e.target.value : '';
                          handleFilterChange('availability', value);
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter - Enhanced */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between text-base">
                  Customer Rating
                  <button 
                    onClick={() => {
                      handleFilterChange('rating', '');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-1">
                  {ratingOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        checked={ratingFilter === option.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('rating', value);
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors flex items-center text-sm">
                        {option.label}
                        <div className="flex ml-2">
                          {(() => {
                            let starCount = 5; // default
                            if (option.value === '4+') starCount = 4;
                            else if (option.value === '4.5+') starCount = 4;
                            else if (option.value === '5') starCount = 5;
                            
                            return [...Array(starCount)].map((_, i) => (
                              <FaStar key={i} className="w-3 h-3 text-amber-400 fill-current" />
                            ));
                          })()}
                          {option.value === '4.5+' && (
                            <div className="relative">
                              <FaStar className="w-3 h-3 text-amber-400 fill-current" />
                              <div className="absolute inset-0 overflow-hidden w-1/2">
                                <FaStar className="w-3 h-3 text-amber-400 fill-current" />
                              </div>
                            </div>
                          )}
                        </div>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weight Filter - Enhanced */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between text-base">
                  Package Size
                  <button 
                    onClick={() => {
                      handleFilterChange('weight', '');
                    }}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-1">
                  {weightOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={weightFilter === option.value}
                        onChange={(e) => {
                          const value = e.target.checked ? e.target.value : '';
                          handleFilterChange('weight', value);
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="ml-3 text-gray-700 font-medium group-hover:text-green-600 transition-colors text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear All Filters - Enhanced */}
              <div className="pt-6 border-t-2 border-gray-100">
                <button
                  onClick={() => {
                    setSearchParams({});
                    dispatch(fetchProducts({}));
                  }}
                  className="w-full py-3 px-4 border-2 border-red-200 bg-red-50 rounded-xl text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  <FaTimesCircle className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setShowFilters(false)}
            ></div>
          )}

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {/* Enhanced Professional Header */}
            <motion.section 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white py-8 px-6 lg:px-8 border-b-2 border-gray-100 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0 gap-4">
                {/* Title Section */}
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-md hidden sm:block">
                    <FaShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                      {isBestsellersPage ? 'Bestsellers Collection' : categoryName ? `${categoryName} Tea Collection` : 'Premium Tea Collection'}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {isLoading ? 'Loading products...' : isBestsellersPage ? `Discover ${finalProducts.length} most popular teas` : `Discover ${finalProducts.length} ${categoryName ? `premium ${categoryName.toLowerCase()} teas` : 'handpicked teas'}`}
                    </p>
                    {categoryName && (
                      <div className="mt-2">
                        <Link
                          to="/shop"
                          className="text-sm text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-1"
                        >
                          ← View all categories
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Search, Sort and View Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md"
                  >
                    <FaFilter className="w-4 h-4" />
                    Filters
                  </button>
                  
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="relative flex-1 sm:flex-none">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search teas..."
                      className="w-full sm:w-64 px-4 py-3 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200 placeholder-gray-400 font-medium"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors"
                    >
                      <FaSearch className="w-5 h-5" />
                    </button>
                  </form>
                  
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={localSortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      disabled={isLoading}
                      className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200 disabled:opacity-50 cursor-pointer font-medium text-gray-700 w-full sm:w-auto shadow-sm hover:shadow-md"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FaChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-3 transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Grid View"
                    >
                      <FaThLarge className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-3 transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      title="List View"
                    >
                      <FaList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Active Filters - Enhanced */}
            {(priceRange || availabilityFilter || ratingFilter || weightFilter || searchTerm) && (
              <motion.section 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 lg:px-8 py-4 bg-green-50 border-b-2 border-green-100"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FaFilter className="w-4 h-4 text-green-600" />
                      Active filters:
                    </span>
                    
                    {searchTerm && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-green-200 text-green-800 rounded-lg text-sm font-medium shadow-sm">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            const newParams = { ...Object.fromEntries(searchParams) };
                            delete newParams.search;
                            setSearchParams(newParams);
                            dispatch(fetchProducts(newParams));
                          }}
                          className="ml-1 hover:text-green-900 p-0.5 hover:bg-green-100 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {priceRange && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-green-200 text-green-800 rounded-lg text-sm font-medium shadow-sm">
                        {priceOptions.find(opt => opt.value === priceRange)?.label}
                        <button
                          onClick={() => {
                            handleFilterChange('price', '');
                          }}
                          className="ml-1 hover:text-green-900 p-0.5 hover:bg-green-100 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {availabilityFilter && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-green-200 text-green-800 rounded-lg text-sm font-medium shadow-sm">
                        {availabilityOptions.find(opt => opt.value === availabilityFilter)?.label}
                        <button
                          onClick={() => {
                            handleFilterChange('availability', '');
                          }}
                          className="ml-1 hover:text-green-900 p-0.5 hover:bg-green-100 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {ratingFilter && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-green-200 text-green-800 rounded-lg text-sm font-medium shadow-sm">
                        {ratingOptions.find(opt => opt.value === ratingFilter)?.label}
                        <button
                          onClick={() => {
                            handleFilterChange('rating', '');
                          }}
                          className="ml-1 hover:text-green-900 p-0.5 hover:bg-green-100 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {weightFilter && (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-green-200 text-green-800 rounded-lg text-sm font-medium shadow-sm">
                        {weightOptions.find(opt => opt.value === weightFilter)?.label}
                        <button
                          onClick={() => {
                            handleFilterChange('weight', '');
                          }}
                          className="ml-1 hover:text-green-900 p-0.5 hover:bg-green-100 rounded transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setSearchParams({});
                      dispatch(fetchProducts({}));
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 hover:bg-white rounded-lg transition-colors"
                  >
                    <FaTimesCircle className="w-4 h-4" />
                    Clear all
                  </button>
                </div>
              </motion.section>
            )}

            {/* Products Grid */}
            <section className="py-8 px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  // Loading skeleton - Compact
                  [...Array(8)].map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-gray-200 rounded-full w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
                        <div className="h-10 bg-gray-200 rounded-xl"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-full text-center py-16">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl max-w-md mx-auto p-8 shadow-lg border-2 border-red-100"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FaExclamationTriangle className="w-10 h-10 text-red-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h3>
                      <p className="text-gray-600 mb-6">{error}</p>
                      <button 
                        onClick={() => dispatch(fetchProducts())}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Try Again
                      </button>
                    </motion.div>
                  </div>
                ) : finalProducts.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl max-w-md mx-auto p-8 shadow-lg border-2 border-gray-100"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FaSearch className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
                      <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria to find what you're looking for.</p>
                      <button
                        onClick={() => {
                          setSearchParams({});
                          dispatch(fetchProducts({}));
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
                      >
                        <FaTimesCircle className="w-5 h-5" />
                        Clear Filters
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  finalProducts.map((product, index) => (
                    <Card.Product
                      key={product._id || product.id}
                      product={{
                        ...product,
                        images: product.mainImage?.url ? [product.mainImage.url] : [product.image || '/images/tea-placeholder.svg'],
                        price: product.defaultPrice || product.price,
                        originalPrice: product.defaultOriginalPrice || product.originalPrice,
                        rating: product.averageRating || product.rating || 0,
                        reviewCount: product.reviewCount || 0,
                        isNew: product.badges?.includes('New'),
                        isFeatured: product.badges?.includes('Best Seller'),
                        discount: product.defaultOriginalPrice ? Math.round(((product.defaultOriginalPrice - product.defaultPrice) / product.defaultOriginalPrice) * 100) : 0
                      }}
                      delay={index}
                      onAddToCart={() => handleAddToCart(product)}
                      onAddToWishlist={() => {
                        // Add to wishlist logic
                        console.log('Add to wishlist:', product.name);
                      }}
                      onViewDetails={() => {
                        // Navigate to product details
                        window.location.href = `/product/${product._id || product.id}`;
                      }}
                    />

                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
