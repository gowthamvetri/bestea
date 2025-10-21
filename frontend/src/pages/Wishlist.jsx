import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaHeart, 
  FaShoppingCart, 
  FaEye, 
  FaTrash,
  FaFilter,
  FaSort,
  FaShareAlt,
  FaTag,
  FaStar,
  FaSearch,
  FaTimesCircle,
  FaPlus,
  FaMinus,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { removeFromWishlist, initializeWishlist, fetchWishlist, removeFromWishlistAPI } from '../store/slices/wishlistSlice';
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';
import AddToCartButton from '../components/common/AddToCartButton';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const wishlistState = useSelector(state => state.wishlist);
  const wishlistItems = Array.isArray(wishlistState?.items) ? wishlistState.items : [];
  const { items: cartItems } = useSelector(state => state.cart);
  const isLoading = wishlistState?.isLoading || false;

  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('addedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]); // Increased max to 10000
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Fetch wishlist from API if authenticated
  useEffect(() => {
    console.log('Fetching wishlist... isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    } else {
      // For non-authenticated users, initialize from localStorage
      dispatch(initializeWishlist());
    }
  }, [dispatch, isAuthenticated]); // Run when auth status changes

  // Debug: Log wishlist state
  useEffect(() => {
    console.log('=== WISHLIST DEBUG ===');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Is Loading:', isLoading);
    console.log('Wishlist Items from Redux:', wishlistItems);
    console.log('Wishlist Items Length:', wishlistItems?.length);
    console.log('Wishlist is Array:', Array.isArray(wishlistItems));
    
    if (wishlistItems.length > 0) {
      console.log('First item sample:', wishlistItems[0]);
    }
    
    const localData = localStorage.getItem('wishlist');
    console.log('localStorage wishlist exists:', !!localData);
    
    console.log('Filtered Items:', filteredItems);
    console.log('Filtered Items Length:', filteredItems?.length);
    console.log('===================');
  }, [wishlistItems, filteredItems, isAuthenticated, isLoading]);

  const categories = ['All', 'Black Tea', 'Green Tea', 'Herbal Tea', 'Spiced Tea'];
  const sortOptions = [
    { value: 'addedDate', label: 'Recently Added' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' }
  ];

  useEffect(() => {
    filterAndSortItems();
  }, [wishlistItems, searchQuery, sortBy, filterBy, priceRange]);

  const filterAndSortItems = () => {
    // Safety check: ensure wishlistItems is an array
    if (!Array.isArray(wishlistItems)) {
      console.warn('wishlistItems is not an array:', wishlistItems);
      setFilteredItems([]);
      return;
    }

    let filtered = [...wishlistItems];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(item => (item.category || '') === filterBy);
    }

    // Price filter
    filtered = filtered.filter(item => {
      const price = item.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'addedDate':
        default:
          return new Date(b.addedDate) - new Date(a.addedDate);
      }
    });

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item) => {
    if (!item || (!item._id && !item.id)) {
      console.error('Invalid item data:', item);
      return;
    }

    dispatch(addToCart({
      product: {
        _id: item._id || item.id,
        name: item.name,
        slug: item.slug,
        mainImage: item.mainImage,
        images: item.images,
        price: item.price,
        defaultPrice: item.price,
        originalPrice: item.originalPrice,
        stock: item.stock || 10
      },
      quantity: 1
    }));
    toast.success(`${item.name} added to cart!`);
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

  // Check if wishlist item is already in cart
  const getCartItem = (wishlistItem) => {
    return cartItems.find(item => item.productId === (wishlistItem._id || wishlistItem.id));
  };

  const handleRemoveFromWishlist = async (itemId) => {
    // Remove item from wishlist using Redux action
    if (!itemId) {
      console.error('No itemId provided to handleRemoveFromWishlist');
      toast.error('Unable to remove item - invalid item ID');
      return;
    }
    
    // Use API if authenticated, localStorage if not
    if (isAuthenticated) {
      await dispatch(removeFromWishlistAPI(itemId));
    } else {
      dispatch(removeFromWishlist(itemId));
    }
    
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    toast.success('Item removed from wishlist');
  };

  const handleMoveToCart = (item) => {
    handleAddToCart(item);
    handleRemoveFromWishlist(item._id);
    toast.success(`${item.name} moved to cart!`);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item._id));
    }
  };

  const handleBulkAddToCart = () => {
    const selectedProducts = filteredItems.filter(item => selectedItems.includes(item._id));
    selectedProducts.forEach(item => {
      if (item.inStock) {
        handleAddToCart(item);
      }
    });
    toast.success(`${selectedProducts.filter(item => item.inStock).length} items added to cart!`);
  };

  const handleBulkRemove = () => {
    selectedItems.forEach(itemId => {
      dispatch(removeFromWishlist(itemId));
    });
    setSelectedItems([]);
    toast.success(`${selectedItems.length} items removed from wishlist`);
  };

  const handleShareWishlist = () => {
    const wishlistUrl = `${window.location.origin}/wishlist/${user?.id || 'guest'}`;
    navigator.clipboard.writeText(wishlistUrl);
    toast.success('Wishlist link copied to clipboard!');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSortBy('addedDate');
    setFilterBy('all');
    setPriceRange([0, 1000]);
    setSelectedItems([]);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FaHeart className="w-8 h-8 text-green-500 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading your wishlist...</h3>
            <p className="text-gray-600">Please wait while we fetch your saved items</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-3xl shadow-xl"
          >
            <div className="relative mb-8">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto shadow-inner">
                <FaHeart className="w-16 h-16 text-green-400" />
              </div>
              <div className="absolute top-0 right-1/2 translate-x-16 -translate-y-2">
                <div className="bg-yellow-100 rounded-full w-8 h-8 flex items-center justify-center shadow-md animate-bounce">
                  <span className="text-xl">✨</span>
                </div>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Start saving your favorite teas and accessories. Click the heart icon on any product to add it here!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <FaShoppingCart className="w-5 h-5" />
              <span>Start Shopping</span>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Enhanced Professional Design */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl shadow-md">
                  <FaHeart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">My Wishlist</h1>
                  <div className="flex items-center gap-3">
                    <p className="text-gray-600 text-sm sm:text-base">
                      {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} saved
                    </p>
                    {wishlistItems.length !== filteredItems.length && (
                      <span className="text-xs text-gray-500">
                        (filtered from {wishlistItems.length})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={handleShareWishlist}
                className="flex items-center justify-center gap-2 px-5 py-3 text-green-700 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <FaShareAlt className="w-5 h-5" />
                <span>Share Wishlist</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters - Enhanced Professional Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search - Enhanced */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search your wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FaTimesCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filters and Controls - Enhanced */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium ${
                  showFilters 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaFilter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-700 font-medium shadow-sm hover:shadow-md cursor-pointer"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

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
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
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
                  <div className="w-5 h-5 flex flex-col justify-center gap-1">
                    <div className="h-1 bg-current rounded-full"></div>
                    <div className="h-1 bg-current rounded-full"></div>
                    <div className="h-1 bg-current rounded-full"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters - Enhanced Professional Design */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t-2 border-gray-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-700 font-medium shadow-sm cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Min"
                    />
                    <span className="text-gray-400 font-medium">to</span>
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-5 py-3 text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md w-full justify-center"
                  >
                    <FaTimesCircle className="w-4 h-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Bulk Actions - Enhanced Professional Design */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-md">
                  {selectedItems.length}
                </div>
                <span className="text-green-900 font-semibold text-lg">
                  {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleBulkAddToCart}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  <FaShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="flex items-center gap-2 px-5 py-3 text-red-700 bg-red-50 border-2 border-red-300 rounded-xl hover:bg-red-100 hover:border-red-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                >
                  <FaTrash className="w-5 h-5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Select All - Enhanced */}
        {filteredItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border-2 border-gray-100"
          >
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredItems.length}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded-md border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer transition-all duration-200"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">
                {selectedItems.length === filteredItems.length ? 'Deselect all items' : 'Select all items'}
              </span>
            </label>
            {selectedItems.length > 0 && selectedItems.length < filteredItems.length && (
              <span className="text-sm text-gray-500">
                {selectedItems.length} of {filteredItems.length} selected
              </span>
            )}
          </motion.div>
        )}

        {/* Wishlist Items - No results found */}
        {filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No items found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any items matching your search criteria. Try adjusting your filters or search query.
            </p>
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
            >
              <FaTimesCircle className="w-5 h-5" />
              <span>Clear all filters</span>
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-200 ${
                  viewMode === 'list' ? 'flex items-center p-4 sm:p-5' : ''
                } ${selectedItems.includes(item._id) ? 'ring-2 ring-green-500 border-green-500' : ''}`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View - Enhanced Professional Design */}
                    <div className="relative group">
                      <div className="relative overflow-hidden bg-gray-100">
                        <img
                          src={getProductImageSrc(item)}
                          alt={item.name || 'Product'}
                          onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Discount Badge */}
                      {item.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                          {item.discount}% OFF
                        </div>
                      )}

                      {/* Stock Status */}
                      {!item.inStock && (
                        <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
                          Out of Stock
                        </div>
                      )}

                      {/* Checkbox */}
                      <div className="absolute bottom-3 left-3 z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-5 h-5 rounded-md border-2 border-white text-green-600 focus:ring-2 focus:ring-green-500 shadow-md cursor-pointer transition-all duration-200"
                        />
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <Link
                          to={`/product/${item._id}`}
                          className="p-2.5 bg-white hover:bg-green-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <FaEye className="w-4 h-4 text-gray-700 hover:text-green-600" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          className="p-2.5 bg-white hover:bg-red-50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <FaTrash className="w-4 h-4 text-red-500 hover:text-red-700" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 flex-1">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg font-medium border border-green-200">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Rating */}
                      {(item.rating || item.reviewCount) && (
                        <div className="flex items-center mb-4">
                          <div className="flex items-center bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <FaStar className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-sm font-semibold text-gray-900 ml-1.5">{item.rating || 0}</span>
                          </div>
                          {item.reviewCount && (
                            <span className="text-xs text-gray-500 ml-2 font-medium">({item.reviewCount} reviews)</span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-baseline mb-4">
                        <span className="text-2xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <>
                            <span className="text-sm text-gray-500 line-through ml-2">₹{item.originalPrice.toLocaleString()}</span>
                            <span className="text-xs text-green-600 font-semibold ml-2">
                              Save ₹{(item.originalPrice - item.price).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {(() => {
                          const cartItem = getCartItem(item);
                          
                          if (!item.inStock) {
                            return (
                              <button
                                disabled
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed font-medium"
                              >
                                <FaShoppingCart className="w-4 h-4" />
                                <span>Out of Stock</span>
                              </button>
                            );
                          }
                          
                          if (cartItem) {
                            return (
                              <div className="flex-1 flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl px-3 py-2.5">
                                <span className="text-sm text-green-700 font-semibold">In Cart:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleDecrementCart(cartItem.id)}
                                    className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                                    title={cartItem.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                                  >
                                    <FaMinus className="w-3 h-3" />
                                  </button>
                                  <span className="min-w-[24px] text-center font-bold text-green-900">{cartItem.quantity}</span>
                                  <button
                                    onClick={() => handleIncrementCart(cartItem.id)}
                                    className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                                  >
                                    <FaPlus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <AddToCartButton 
                              product={item}
                              size="medium"
                              className="flex-1"
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View - Enhanced Professional & Responsive Design */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Checkbox - Mobile & Desktop */}
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="w-5 h-5 rounded-md border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer transition-all duration-200"
                        />
                      </div>

                      {/* Image Section */}
                      <div className="relative flex-shrink-0">
                        <div className="relative overflow-hidden rounded-xl bg-gray-100 shadow-md group">
                          <img
                            src={getProductImageSrc(item)}
                            alt={item.name || 'Product'}
                            onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                            className="w-full sm:w-32 h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {/* Discount Badge */}
                          {item.discount > 0 && (
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-md">
                              {item.discount}% OFF
                            </div>
                          )}
                          {/* Stock Status */}
                          {!item.inStock && (
                            <div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded-lg text-xs font-semibold shadow-md">
                              Out of Stock
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section - Flex 1 */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                            
                            {/* Tags */}
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {item.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg font-medium border border-green-200">
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 3 && (
                                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                    +{item.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Rating and Category */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {(item.rating || item.reviewCount) && (
                                <div className="flex items-center bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                                  <FaStar className="w-4 h-4 text-amber-500" />
                                  <span className="text-sm font-semibold text-gray-900 ml-1.5">
                                    {item.rating || 0}
                                  </span>
                                  {item.reviewCount && (
                                    <span className="text-xs text-gray-500 ml-1">({item.reviewCount})</span>
                                  )}
                                </div>
                              )}
                              {item.category && (
                                <span className="px-2.5 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-200">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            {/* Price Section */}
                            <div className="flex flex-wrap items-baseline gap-2 mb-4">
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{item.price.toLocaleString()}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <>
                                  <span className="text-base text-gray-500 line-through">
                                    ₹{item.originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-sm text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                                    Save ₹{(item.originalPrice - item.price).toLocaleString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons Section */}
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 lg:gap-2 lg:min-w-[200px]">
                            {/* Quick View Button */}
                            <Link
                              to={`/product/${item._id}`}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                              <FaEye className="w-4 h-4" />
                              <span className="hidden sm:inline">Quick View</span>
                            </Link>
                            
                            {/* Cart Action Button */}
                            {(() => {
                              const cartItem = getCartItem(item);
                              
                              if (!item.inStock) {
                                return (
                                  <button
                                    disabled
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed font-medium"
                                  >
                                    <FaShoppingCart className="w-4 h-4" />
                                    <span>Out of Stock</span>
                                  </button>
                                );
                              }
                              
                              if (cartItem) {
                                return (
                                  <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 rounded-xl px-3 py-2.5 shadow-sm">
                                    <span className="text-sm text-green-700 font-semibold">In Cart:</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleDecrementCart(cartItem.id)}
                                        className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                                        title={cartItem.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                                      >
                                        <FaMinus className="w-3 h-3" />
                                      </button>
                                      <span className="min-w-[32px] text-center font-bold text-green-900">{cartItem.quantity}</span>
                                      <button
                                        onClick={() => handleIncrementCart(cartItem.id)}
                                        className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200"
                                      >
                                        <FaPlus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <AddToCartButton 
                                  product={item}
                                  size="medium"
                                />
                              );
                            })()}

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveFromWishlist(item._id)}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 border-2 border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                            >
                              <FaTrash className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State for Filtered Results */}
        {filteredItems.length === 0 && wishlistItems.length > 0 && (
          <div className="text-center py-12">
            <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items match your filters</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Continue Shopping - Enhanced */}
        {filteredItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <FaShoppingCart className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
