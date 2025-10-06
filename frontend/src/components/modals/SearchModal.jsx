import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaSearch, 
  FaClock, 
  FaChartLine,
  FaArrowRight 
} from 'react-icons/fa';

// Store actions
import { toggleSearchModal } from '../../store/slices/uiSlice';

const SearchModal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSearchModalOpen } = useSelector(state => state.ui);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Trending searches - can be fetched from API or kept as static
  const trendingSearches = [
    'Strong Tea',
    'Cardamom Tea',
    'Assam Gold',
    'Royal Blend',
    'Premium Tea',
    'Combo Pack'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('bestea_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Debounced search
    if (searchTerm.trim()) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm]);

  const performSearch = async (query) => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.products);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    dispatch(toggleSearchModal());
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;
    
    // Add to recent searches
    const updatedRecent = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('bestea_recent_searches', JSON.stringify(updatedRecent));
    
    // Navigate to shop with search query
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    handleClose();
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    handleClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <AnimatePresence>
      {isSearchModalOpen && (
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "tween", duration: 0.3 }}
            className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-96"
          >
            {/* Search Input */}
            <div className="p-4 border-b">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for teas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-3 border-0 bg-gray-50 rounded-lg text-lg focus:ring-2 focus:ring-primary-400 focus:bg-white"
                  autoFocus
                />
                <button
                  onClick={handleClose}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                >
                  <FaTimes className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Search Content */}
            <div className="max-h-80 overflow-y-auto">
              {isSearching ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-600">Searching...</p>
                </div>
              ) : searchTerm.trim() ? (
                searchResults.length > 0 ? (
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Search Results
                    </h3>
                    <div className="space-y-2">
                      {searchResults.map((product) => (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left transition-colors"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-primary-400">
                                ₹{product.price}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                          </div>
                          <FaArrowRight className="text-gray-400" />
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleSearch(searchTerm)}
                      className="w-full mt-4 p-3 bg-primary-50 text-primary-400 font-medium rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      View all results for "{searchTerm}"
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-600 mb-4">
                      No results found for "{searchTerm}"
                    </p>
                    <button
                      onClick={() => handleSearch(searchTerm)}
                      className="btn btn-primary"
                    >
                      Search anyway
                    </button>
                  </div>
                )
              ) : (
                <div className="p-4 space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <FaClock className="text-gray-400" />
                        Recent Searches
                      </h3>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className="block w-full text-left p-2 hover:bg-gray-50 rounded text-gray-700"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Trending Searches */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <FaChartLine className="text-gray-400" />
                      Trending Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
