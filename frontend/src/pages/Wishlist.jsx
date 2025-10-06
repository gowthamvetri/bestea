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
  FaMinus
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, updateQuantity, removeFromCart } from '../store/slices/cartSlice';
import { removeFromWishlist } from '../store/slices/wishlistSlice';
import { getProductImageSrc, handleImageError, DEFAULT_PRODUCT_IMAGE } from '../utils/imageUtils';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const { items: cartItems } = useSelector(state => state.cart);

  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('addedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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

  const handleRemoveFromWishlist = (itemId) => {
    // Remove item from wishlist using Redux action
    if (!itemId) {
      console.error('No itemId provided to handleRemoveFromWishlist');
      toast.error('Unable to remove item - invalid item ID');
      return;
    }
    dispatch(removeFromWishlist(itemId));
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

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <FaHeart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8">
              Save items you love by clicking the heart icon on any product
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <button
              onClick={handleShareWishlist}
              className="flex items-center px-4 py-2 text-orange-600 border border-orange-600 rounded-md hover:bg-orange-50 transition-colors"
            >
              <FaShareAlt className="w-4 h-4 mr-2" />
              Share Wishlist
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="w-4 h-4 mr-2" />
                Filters
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-1">
                    <div className="bg-current"></div>
                    <div className="bg-current"></div>
                    <div className="bg-current"></div>
                    <div className="bg-current"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="w-4 h-4 flex flex-col gap-1">
                    <div className="h-1 bg-current"></div>
                    <div className="h-1 bg-current"></div>
                    <div className="h-1 bg-current"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="flex-1"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center px-4 py-2 text-orange-600 hover:text-orange-800 transition-colors"
                  >
                    <FaTimesCircle className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-orange-800">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBulkAddToCart}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  <FaShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="flex items-center px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <FaTrash className="w-4 h-4 mr-2" />
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Select All */}
        {filteredItems.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedItems.length === filteredItems.length}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Select all items</span>
            </label>
          </div>
        )}

        {/* Wishlist Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <FaSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 text-orange-600 hover:text-orange-800 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredItems.map(item => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'overflow-hidden'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="relative">
                      <img
                        src={getProductImageSrc(item)}
                        alt={item.name || 'Product'}
                        onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                        className="w-full h-48 object-cover"
                      />
                      
                      {/* Discount Badge */}
                      {item.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                          {item.discount}% OFF
                        </div>
                      )}

                      {/* Stock Status */}
                      {!item.inStock && (
                        <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                          Out of Stock
                        </div>
                      )}

                      {/* Checkbox */}
                      <div className="absolute bottom-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleSelectItem(item._id)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        <Link
                          to={`/product/${item._id}`}
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        >
                          <FaEye className="w-4 h-4 text-gray-600" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        >
                          <FaTrash className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      </div>

                      <p className="text-gray-600 text-xs mb-2 line-clamp-2">{item.description}</p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Rating */}
                      {(item.rating || item.reviewCount) && (
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <FaStar className="w-3 h-3 text-yellow-400" />
                            <span className="text-sm text-gray-600 ml-1">{item.rating || 0}</span>
                          </div>
                          {item.reviewCount && (
                            <span className="text-xs text-gray-500 ml-2">({item.reviewCount})</span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center mb-3">
                        <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{item.originalPrice}</span>
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
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                              >
                                <FaShoppingCart className="w-3 h-3 mr-1" />
                                <span className="text-xs">Out of Stock</span>
                              </button>
                            );
                          }
                          
                          if (cartItem) {
                            return (
                              <div className="flex-1 flex items-center justify-between bg-orange-100 border border-orange-200 rounded-md px-2 py-1">
                                <span className="text-xs text-orange-700 font-medium">In Cart:</span>
                                <div className="flex items-center">
                                  <button
                                    onClick={() => handleDecrementCart(cartItem.id)}
                                    className="p-1 text-orange-600 hover:bg-orange-200 rounded-full"
                                    title={cartItem.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                                  >
                                    <FaMinus className="w-2 h-2" />
                                  </button>
                                  <span className="mx-2 text-xs font-bold text-orange-700">{cartItem.quantity}</span>
                                  <button
                                    onClick={() => handleIncrementCart(cartItem.id)}
                                    className="p-1 text-orange-600 hover:bg-orange-200 rounded-full"
                                  >
                                    <FaPlus className="w-2 h-2" />
                                  </button>
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                            >
                              <FaShoppingCart className="w-3 h-3 mr-1" />
                              <span className="text-xs">Add to Cart</span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item._id)}
                        onChange={() => handleSelectItem(item._id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>

                    <div className="relative">
                      <img
                        src={getProductImageSrc(item)}
                        alt={item.name || 'Product'}
                        onError={(e) => handleImageError(e, DEFAULT_PRODUCT_IMAGE)}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      {item.discount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs">
                          {item.discount}%
                        </div>
                      )}
                    </div>

                    <div className="flex-1 ml-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Rating and Price */}
                          <div className="flex items-center gap-4">
                            {(item.rating || item.reviewCount) && (
                              <div className="flex items-center">
                                <FaStar className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {item.rating || 0} {item.reviewCount && `(${item.reviewCount})`}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through ml-2">₹{item.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            to={`/product/${item._id}`}
                            className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          
                          {(() => {
                            const cartItem = getCartItem(item);
                            
                            if (!item.inStock) {
                              return (
                                <button
                                  disabled
                                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                                >
                                  <FaShoppingCart className="w-4 h-4 mr-2" />
                                  Out of Stock
                                </button>
                              );
                            }
                            
                            if (cartItem) {
                              return (
                                <div className="flex items-center bg-orange-100 border border-orange-200 rounded-md px-3 py-2">
                                  <span className="text-sm text-orange-700 font-medium mr-3">In Cart:</span>
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => handleDecrementCart(cartItem.id)}
                                      className="p-1 text-orange-600 hover:bg-orange-200 rounded-full"
                                      title={cartItem.quantity === 1 ? "Remove from cart" : "Decrease quantity"}
                                    >
                                      <FaMinus className="w-3 h-3" />
                                    </button>
                                    <span className="mx-3 font-bold text-orange-700">{cartItem.quantity}</span>
                                    <button
                                      onClick={() => handleIncrementCart(cartItem.id)}
                                      className="p-1 text-orange-600 hover:bg-orange-200 rounded-full"
                                    >
                                      <FaPlus className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                              >
                                <FaShoppingCart className="w-4 h-4 mr-2" />
                                Add to Cart
                              </button>
                            );
                          })()}

                          <button
                            onClick={() => handleRemoveFromWishlist(item._id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
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
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
