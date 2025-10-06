import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
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
  FaMinus
} from 'react-icons/fa';

// Store actions
import { fetchProducts, setFilters, fetchCategories } from '../store/slices/productSlice';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const Shop = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, error, categories } = useSelector(state => state.products);
  const { items: cartItems } = useSelector(state => state.cart);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState('');
  const [localSortBy, setLocalSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);



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

  useEffect(() => {
    // Debounce product fetching to prevent too many requests
    const timeoutId = setTimeout(() => {
      const params = Object.fromEntries(searchParams);
      dispatch(fetchProducts(params));
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchParams]);

  // Sync local state with URL parameters
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    setLocalSortBy(params.sort || 'name-asc');
    setPriceRange(params.price || '');
    setAvailabilityFilter(params.availability || '');
    setRatingFilter(params.rating || '');
    setWeightFilter(params.weight || '');
  }, [searchParams]);

  // Update product display when products change
  const displayProducts = products.length > 0 ? products : [];

  // Handle dynamic filter changes
  const handleFilterChange = (filterType, value) => {
    const newParams = { ...Object.fromEntries(searchParams) };
    
    if (value) {
      newParams[filterType] = value;
    } else {
      delete newParams[filterType];
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
      filtered = filtered.filter(product => {
        switch (availabilityFilter) {
          case 'in-stock':
            return (product.stock || 0) > 0;
          case 'on-sale':
            return product.defaultOriginalPrice || product.originalPrice;
          case 'bestseller':
            return product.badges?.includes('Best Seller') || product.isBestseller;
          default:
            return true;
        }
      });
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

  return (
    <>
      <Helmet>
        <title>Shop - Premium Tea Collection | Bestea</title>
        <meta name="description" content="Discover our premium collection of authentic Indian teas. From classic Assam to exotic Darjeeling - find your perfect cup." />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed top-20 left-4 z-50">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-bestea-500 text-white p-3 rounded-full shadow-lg hover:bg-bestea-600 transition-colors"
            >
              <FaFilter className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Filter - Professional Style */}
          <div className={`w-80 bg-white shadow-sm border-r border-slate-200 min-h-screen transition-transform duration-300 ${
            showFilters ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static top-0 left-0 z-40 lg:z-auto`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Filter by</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-slate-500 hover:text-slate-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              {/* Price Filter */}
              <div className="mb-8">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center justify-between">
                  Price Range
                  <button 
                    onClick={() => {
                      setPriceRange('');
                      handleFilterChange('price', '');
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-3">
                  {priceOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPriceRange(value);
                          handleFilterChange('price', value);
                        }}
                        className="w-4 h-4 text-bestea-600 border-slate-300 focus:ring-bestea-500"
                      />
                      <span className="ml-3 text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-8">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center justify-between">
                  Availability
                  <button 
                    onClick={() => {
                      setAvailabilityFilter('');
                      handleFilterChange('availability', '');
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-3">
                  {availabilityOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={availabilityFilter === option.value}
                        onChange={(e) => {
                          const value = e.target.checked ? e.target.value : '';
                          setAvailabilityFilter(value);
                          handleFilterChange('availability', value);
                        }}
                        className="w-4 h-4 text-bestea-600 border-slate-300 rounded focus:ring-bestea-500"
                      />
                      <span className="ml-3 text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-8">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center justify-between">
                  Customer Rating
                  <button 
                    onClick={() => {
                      setRatingFilter('');
                      handleFilterChange('rating', '');
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-3">
                  {ratingOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={option.value}
                        checked={ratingFilter === option.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRatingFilter(value);
                          handleFilterChange('rating', value);
                        }}
                        className="w-4 h-4 text-bestea-600 border-slate-300 focus:ring-bestea-500"
                      />
                      <span className="ml-3 text-slate-700 flex items-center">
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

              {/* Weight Filter */}
              <div className="mb-8">
                <h3 className="font-medium text-slate-900 mb-4 flex items-center justify-between">
                  Package Size
                  <button 
                    onClick={() => {
                      setWeightFilter('');
                      handleFilterChange('weight', '');
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </h3>
                <div className="space-y-3">
                  {weightOptions.slice(1).map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={weightFilter === option.value}
                        onChange={(e) => {
                          const value = e.target.checked ? e.target.value : '';
                          setWeightFilter(value);
                          handleFilterChange('weight', value);
                        }}
                        className="w-4 h-4 text-bestea-600 border-slate-300 rounded focus:ring-bestea-500"
                      />
                      <span className="ml-3 text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear All Filters */}
              <div className="pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setPriceRange('');
                    setAvailabilityFilter('');
                    setRatingFilter('');
                    setWeightFilter('');
                    setSearchTerm('');
                    setSearchParams({});
                    dispatch(fetchProducts({}));
                  }}
                  className="w-full py-3 px-4 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                >
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
            />
          )}

          {/* Main Content */}
          <div className="flex-1 lg:ml-0">
            {/* Modern Header */}
            <section className="bg-white py-8 px-8 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Premium Tea Collection
                  </h1>
                  <p className="text-gray-600">
                    {isLoading ? 'Loading products...' : `Discover ${finalProducts.length} handpicked teas`}
                  </p>
                </div>
                
                {/* Search and Sort */}
                <div className="flex items-center space-x-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-3 bg-bestea-500 text-white rounded-xl hover:bg-bestea-600 transition-colors"
                  >
                    <FaFilter className="w-4 h-4" />
                    Filters
                  </button>
                  {/* Search Bar */}
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search teas..."
                      className="w-64 px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-2xl focus:border-bestea-400 focus:ring-2 focus:ring-bestea-100 transition-all duration-300 placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-bestea-500 transition-colors"
                    >
                      <FaSearch size={16} />
                    </button>
                  </form>
                  
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={localSortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      disabled={isLoading}
                      className="appearance-none bg-white border border-gray-200 rounded-2xl px-4 py-3 pr-10 focus:border-bestea-400 focus:ring-2 focus:ring-bestea-100 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <i className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></i>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Active Filters */}
            {(priceRange || availabilityFilter || ratingFilter || weightFilter || searchTerm) && (
              <section className="px-8 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700">Active filters:</span>
                    
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-bestea-100 text-bestea-800 rounded-full text-sm">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            const newParams = { ...Object.fromEntries(searchParams) };
                            delete newParams.search;
                            setSearchParams(newParams);
                            dispatch(fetchProducts(newParams));
                          }}
                          className="ml-1 hover:text-bestea-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {priceRange && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-bestea-100 text-bestea-800 rounded-full text-sm">
                        {priceOptions.find(opt => opt.value === priceRange)?.label}
                        <button
                          onClick={() => {
                            setPriceRange('');
                            handleFilterChange('price', '');
                          }}
                          className="ml-1 hover:text-bestea-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {availabilityFilter && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-bestea-100 text-bestea-800 rounded-full text-sm">
                        {availabilityOptions.find(opt => opt.value === availabilityFilter)?.label}
                        <button
                          onClick={() => {
                            setAvailabilityFilter('');
                            handleFilterChange('availability', '');
                          }}
                          className="ml-1 hover:text-bestea-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {ratingFilter && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-bestea-100 text-bestea-800 rounded-full text-sm">
                        {ratingOptions.find(opt => opt.value === ratingFilter)?.label}
                        <button
                          onClick={() => {
                            setRatingFilter('');
                            handleFilterChange('rating', '');
                          }}
                          className="ml-1 hover:text-bestea-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    
                    {weightFilter && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-bestea-100 text-bestea-800 rounded-full text-sm">
                        {weightOptions.find(opt => opt.value === weightFilter)?.label}
                        <button
                          onClick={() => {
                            setWeightFilter('');
                            handleFilterChange('weight', '');
                          }}
                          className="ml-1 hover:text-bestea-900"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setPriceRange('');
                      setAvailabilityFilter('');
                      setRatingFilter('');
                      setWeightFilter('');
                      setSearchTerm('');
                      setSearchParams({});
                      dispatch(fetchProducts({}));
                    }}
                    className="text-sm text-slate-600 hover:text-bestea-600 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </section>
            )}

            {/* Products Grid */}
            <section className="py-12 px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {isLoading ? (
                  // Loading skeleton
                  [...Array(8)].map((_, index) => (
                    <div key={index} className="modern-card animate-pulse">
                      <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl mb-4"></div>
                      <div className="p-6 space-y-3">
                        <div className="h-4 bg-slate-200 rounded-full"></div>
                        <div className="h-3 bg-slate-200 rounded-full w-2/3"></div>
                        <div className="h-6 bg-slate-200 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-full text-center py-20">
                    <div className="modern-card max-w-md mx-auto p-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaExclamationTriangle className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h3>
                      <p className="text-slate-600 mb-6">{error}</p>
                      <button 
                        onClick={() => dispatch(fetchProducts())}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : finalProducts.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <div className="modern-card max-w-md mx-auto p-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaSearch className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
                      <p className="text-slate-600">Try adjusting your search or filter criteria</p>
                    </div>
                  </div>
                ) : (
                  finalProducts.map((product, index) => (
                    <Link 
                      key={product._id || product.id} 
                      to={`/product/${product._id || product.id}`}
                      className="block group"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="modern-card hover-scale group cursor-pointer relative overflow-hidden"
                      >
                        {/* Badge */}
                        {product.badges && product.badges.length > 0 && (
                          <div className="absolute top-4 left-4 z-10">
                            <motion.span 
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg backdrop-blur-sm ${
                                product.badges[0] === 'Best Seller' ? 'bg-gradient-to-r from-bestea-500 to-bestea-600' :
                                product.badges[0] === 'Super Saver' ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                                'bg-gradient-to-r from-red-500 to-red-600'
                              }`}
                            >
                              {product.badges[0]}
                            </motion.span>
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <div className="absolute top-4 right-4 z-10">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Add wishlist functionality
                            }}
                          >
                            <FaHeart className="w-4 h-4 text-slate-600 hover:text-red-500 transition-colors" />
                          </motion.button>
                        </div>
                        
                        {/* Product Image */}
                        <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                          <img
                            src={product.mainImage?.url || product.image || '/images/tea-placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Product Info */}
                        <div className="p-6 pt-0">
                          {/* Category */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-bestea-600 bg-bestea-50 px-2 py-1 rounded-full">
                              {product.category?.name || 'Premium Tea'}
                            </span>
                            <div className="flex items-center gap-1">
                              <FaStar className="w-3 h-3 text-amber-400" />
                              <span className="text-xs font-medium text-slate-600">
                                {product.averageRating || product.rating || 4.8}
                              </span>
                            </div>
                          </div>

                          {/* Name */}
                          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-bestea-600 transition-colors">
                            {product.name}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {product.shortDescription || (product.description ? product.description.substring(0, 80) + '...' : 'Premium quality tea blend')}
                          </p>

                          {/* Specifications */}
                          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-bestea-400 rounded-full"></div>
                              {product.type === 'loose' ? 'Loose Leaf' : 'Tea Bags'}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                              {product.weight || '100'}g
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                              {product.cupCount || product.cups || 50} Cups
                            </span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-slate-900">
                                ₹{product.defaultPrice || product.price}
                              </span>
                              {(product.defaultOriginalPrice || product.originalPrice) && (
                                <span className="text-sm text-slate-500 line-through">
                                  ₹{product.defaultOriginalPrice || product.originalPrice}
                                </span>
                              )}
                            </div>
                            {(product.defaultOriginalPrice || product.originalPrice) && (
                              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                {Math.round(((product.defaultOriginalPrice || product.originalPrice) - (product.defaultPrice || product.price)) / (product.defaultOriginalPrice || product.originalPrice) * 100)}% OFF
                              </span>
                            )}
                          </div>

                          {/* Add to Cart Button */}
                          {(() => {
                            const cartItem = getCartItem(product);
                            
                            if (product.stock === 0) {
                              return (
                                <button
                                  disabled
                                  className="w-full py-3 px-4 rounded-xl font-semibold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <FaShoppingCart className="w-4 h-4" />
                                  Out of Stock
                                </button>
                              );
                            }
                            
                            if (cartItem) {
                              return (
                                <div 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  className="flex items-center justify-between bg-bestea-50 border-2 border-bestea-200 rounded-xl p-2"
                                >
                                  <span className="text-sm text-bestea-700 font-medium">In Cart:</span>
                                  <div className="flex items-center">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDecrementCart(cartItem.id);
                                      }}
                                      className="p-1 text-bestea-600 hover:bg-bestea-100 rounded-full"
                                      title={cartItem.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                                    >
                                      <FaMinus className="w-3 h-3" />
                                    </motion.button>
                                    <span className="mx-3 font-bold text-bestea-700">{cartItem.quantity}</span>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleIncrementCart(cartItem.id);
                                      }}
                                      className="p-1 text-bestea-600 hover:bg-bestea-100 rounded-full"
                                    >
                                      <FaPlus className="w-3 h-3" />
                                    </motion.button>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-bestea-500 to-bestea-600 hover:from-bestea-600 hover:to-bestea-700 text-white shadow-lg hover:shadow-bestea-500/25"
                              >
                                <FaShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </motion.button>
                            );
                          })()}
                        </div>
                      </motion.div>
                    </Link>
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
